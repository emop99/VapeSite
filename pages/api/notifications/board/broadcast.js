import {getServerSession} from 'next-auth/next';
import {Board, BoardNotificationPreference, Notification, NotificationSettings, PushSubscription, User} from '../../../../models';

const webpush = require('web-push');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }

  // 관리자 또는 시스템 요청 확인
  const session = await getServerSession(req, res);
  const isSystemRequest = req.headers['x-api-key'] === process.env.INTERNAL_API_KEY;

  if (!session && !isSystemRequest) {
    return res.status(401).json({message: '인증이 필요합니다.'});
  }

  const {boardId, notification, userId, postId} = req.body;

  if (!boardId || !notification || !userId || !postId) {
    return res.status(400).json({message: '게시판 번호, 게시글 번호, 유저 번호, 알림 내용이 필요합니다.'});
  }

  try {
    // 게시판 존재 확인
    const board = await Board.findOne({
      where: {id: boardId, isActive: true}
    });

    if (!board) {
      return res.status(404).json({message: '게시판을 찾을 수 없습니다.'});
    }

    // 해당 게시판 알림을 활성화한 사용자들 조회
    // 1. 명시적으로 활성화한 사용자들
    const enabledPreferences = await BoardNotificationPreference.findAll({
      where: {boardId, enabled: true},
      include: [{
        model: User,
        where: {deletedAt: null},
        attributes: ['id', 'email']
      }]
    });

    // 알림을 받을 사용자들
    const targetUsers = [
      ...enabledPreferences.map(p => p.User),
    ];

    if (targetUsers.length === 0) {
      return res.status(200).json({
        message: '해당 게시판에 알림을 받을 사용자가 없습니다.',
        sent: 0
      });
    }

    // Web Push 설정
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_MAILTO}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    let totalSent = 0;
    let totalFailed = 0;
    const results = [];

    // 각 사용자에게 알림 전송
    for (const user of targetUsers) {
      try {
        // 사용자의 알림 설정 확인
        const settings = await NotificationSettings.findOne({
          where: {userId: user.id}
        });

        // 푸시 알림이 비활성화된 경우 스킵
        if (settings && !settings.pushEnabled) {
          continue;
        }

        // 사용자 알림 테이블에 내역 Insert
        // 알림 생성
        await Notification.create({
          userId: user.id,
          senderId: userId,
          type: 'new_post',
          postId: postId,
          commentId: null,
          content: notification.body,
          url: notification.url,
          isRead: false
        });

        // 사용자의 푸시 구독 정보 조회
        const subscriptions = await PushSubscription.findAll({
          where: {userId: user.id}
        });

        if (subscriptions.length === 0) {
          continue;
        }

        // 각 구독에 푸시 알림 전송
        for (const subscription of subscriptions) {
          try {
            // 푸시 구독 객체 생성
            const pushSubscription = {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            };

            // 알림 페이로드
            const payload = JSON.stringify(notification);

            // 푸시 알림 전송
            await webpush.sendNotification(pushSubscription, payload);

            totalSent++;
            results.push({
              userId: user.id,
              subscriptionId: subscription.id,
              success: true
            });
          } catch (error) {
            console.error(`푸시 알림 전송 실패 (사용자: ${user.id}, 구독 ID: ${subscription.id}):`, error);

            // 구독이 만료되었거나 유효하지 않은 경우 삭제
            if (error.statusCode === 404 || error.statusCode === 410) {
              await subscription.destroy();
            }

            totalFailed++;
            results.push({
              userId: user.id,
              subscriptionId: subscription.id,
              success: false,
              error: error.message
            });
          }
        }
      } catch (userError) {
        console.error(`사용자 ${user.id} 처리 중 오류:`, userError);
        totalFailed++;
      }
    }

    return res.status(200).json({
      message: `게시판 '${board.name}' 알림 전송 완료: ${totalSent}개 성공, ${totalFailed}개 실패`,
      boardName: board.name,
      targetUsers: targetUsers.length,
      sent: totalSent,
      failed: totalFailed,
      results: results.slice(0, 10) // 최대 10개 결과만 반환
    });
  } catch (error) {
    console.error('게시판 알림 전송 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}