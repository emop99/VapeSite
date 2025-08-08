import {getServerSession} from 'next-auth/next';
import {NotificationSettings, PushSubscription, User} from '../../../../models';

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

  const {userId, notification} = req.body;

  if (!userId || !notification) {
    return res.status(400).json({message: '사용자 ID와 알림 내용이 필요합니다.'});
  }

  try {
    // 사용자 정보 조회
    const user = await User.findOne({
      where: {id: userId, deletedAt: null}
    });

    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 사용자의 알림 설정 확인
    const settings = await NotificationSettings.findOne({
      where: {userId}
    });

    // 푸시 알림이 비활성화된 경우
    if (settings && !settings.pushEnabled) {
      return res.status(200).json({
        message: '사용자가 푸시 알림을 비활성화했습니다.',
        sent: 0
      });
    }

    // 사용자의 푸시 구독 정보 조회
    const subscriptions = await PushSubscription.findAll({
      where: {userId}
    });

    if (subscriptions.length === 0) {
      return res.status(200).json({
        message: '사용자의 푸시 구독 정보가 없습니다.',
        sent: 0
      });
    }

    // Web Push 설정
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_MAILTO}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    // 각 구독에 푸시 알림 전송
    const results = [];
    let sentCount = 0;
    let failedCount = 0;

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

        // 푸시 알림 전송 (실제 구현 시 주석 해제)
        await webpush.sendNotification(pushSubscription, payload);

        // 전송 성공 처리
        results.push({
          subscriptionId: subscription.id,
          success: true
        });
        sentCount++;
      } catch (error) {
        console.error(`푸시 알림 전송 실패 (구독 ID: ${subscription.id}):`, error);

        // 구독이 만료되었거나 유효하지 않은 경우 삭제
        if (error.statusCode === 404 || error.statusCode === 410) {
          await subscription.destroy();
        }

        results.push({
          subscriptionId: subscription.id,
          success: false,
          error: error.message
        });
        failedCount++;
      }
    }

    return res.status(200).json({
      message: `푸시 알림 전송 완료: ${sentCount}개 성공, ${failedCount}개 실패`,
      sent: sentCount,
      failed: failedCount,
      results
    });
  } catch (error) {
    console.error('푸시 알림 전송 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}