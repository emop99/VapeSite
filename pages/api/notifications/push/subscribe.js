import {getServerSession} from 'next-auth/next';
import {PushSubscription, User} from '../../../../models';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }

  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {subscription, userAgent} = req.body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({message: '구독 정보가 필요합니다.'});
  }

  try {
    // 사용자 정보 조회
    const user = await User.findOne({
      where: {email: session.user.email, deletedAt: null}
    });
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 기존 구독 확인 (동일한 엔드포인트가 있는지)
    const existingSubscription = await PushSubscription.findOne({
      where: {endpoint: subscription.endpoint}
    });

    if (existingSubscription) {
      // 기존 구독 업데이트
      await existingSubscription.update({
        userId: user.id,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
        expirationTime: subscription.expirationTime ? new Date(subscription.expirationTime) : null,
      });

      return res.status(200).json({
        message: '푸시 알림 구독이 업데이트되었습니다.',
        subscription: existingSubscription
      });
    } else {
      // 새 구독 생성
      const newSubscription = await PushSubscription.create({
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
        expirationTime: subscription.expirationTime ? new Date(subscription.expirationTime) : null,
      });

      return res.status(201).json({
        message: '푸시 알림 구독이 생성되었습니다.',
        subscription: newSubscription
      });
    }
  } catch (error) {
    console.error('푸시 알림 구독 처리 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}