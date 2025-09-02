import {Notification, PushSubscription, User} from '../../../../models';

const webpush = require('web-push');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }

  const {message} = req.body;

  if (!message) {
    return res.status(400).json({message: '메시지가 필요합니다.'});
  }

  try {
    // Header Key 확인
    const isSystemRequest = req.headers['x-api-key'] === process.env.INTERNAL_API_KEY;
    if (!isSystemRequest) {
      return res.status(401).json({message: '인증이 필요합니다.'});
    }

    // 모든 관리자 계정 조회
    const adminUsers = await User.findAll({
      where: {
        grade: 'ADMIN',
        deletedAt: null
      }
    });

    if (adminUsers.length === 0) {
      return res.status(404).json({message: '관리자 계정이 없습니다.'});
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

    // 각 관리자에게 알림 생성 및 푸시 알림 전송
    for (const admin of adminUsers) {
      try {
        // 시스템 알림 생성
        const notification = await Notification.create({
          userId: admin.id,
          senderId: admin.id,
          type: 'system',
          postId: 1, // 시스템 알림의 경우 기본값
          commentId: null,
          content: message,
          url: '/notifications', // 관리자 알림 페이지로 이동
          isRead: false
        });

        // 관리자의 푸시 구독 정보 조회
        const subscriptions = await PushSubscription.findAll({
          where: {userId: admin.id}
        });

        let userSent = 0;
        let userFailed = 0;

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
            const payload = JSON.stringify({
              title: '시스템 알림',
              body: message,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              tag: 'system-notification',
              data: {
                url: '/notifications',
                notificationId: notification.id
              }
            });

            // 푸시 알림 전송
            await webpush.sendNotification(pushSubscription, payload);
            userSent++;
            totalSent++;
          } catch (error) {
            console.error(`푸시 알림 전송 실패 (구독 ID: ${subscription.id}):`, error);

            // 구독이 만료되었거나 유효하지 않은 경우 삭제
            if (error.statusCode === 404 || error.statusCode === 410) {
              await subscription.destroy();
            }

            userFailed++;
            totalFailed++;
          }
        }

        results.push({
          userId: admin.id,
          nickName: admin.nickName,
          notificationCreated: true,
          pushSent: userSent,
          pushFailed: userFailed
        });

      } catch (error) {
        console.error(`관리자 ${admin.id}에게 알림 전송 실패:`, error);
        results.push({
          userId: admin.id,
          nickName: admin.nickName,
          notificationCreated: false,
          pushSent: 0,
          pushFailed: 0,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      message: `관리자 ${adminUsers.length}명에게 시스템 알림 전송 완료`,
      totalAdmins: adminUsers.length,
      totalPushSent: totalSent,
      totalPushFailed: totalFailed,
      results
    });

  } catch (error) {
    console.error('관리자 알림 전송 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}