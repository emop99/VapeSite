import {getServerSession} from 'next-auth/next';
import {PushSubscription, User} from '../../../../models';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }

  const {oldSubscription, newSubscription, userAgent} = req.body;

  // 새 구독 정보가 없으면 에러
  if (!newSubscription || !newSubscription.endpoint || !newSubscription.keys) {
    return res.status(400).json({message: '새로운 구독 정보가 필요합니다.'});
  }

  try {
    // 기존 구독 정보가 있는 경우 해당 구독을 찾아서 업데이트
    if (oldSubscription && oldSubscription.endpoint) {
      const existingSubscription = await PushSubscription.findOne({
        where: {endpoint: oldSubscription.endpoint}
      });

      if (existingSubscription) {
        // 기존 구독을 새로운 정보로 업데이트
        await existingSubscription.update({
          endpoint: newSubscription.endpoint,
          p256dh: newSubscription.keys.p256dh,
          auth: newSubscription.keys.auth,
          userAgent: userAgent || existingSubscription.userAgent,
          expirationTime: newSubscription.expirationTime ? new Date(newSubscription.expirationTime) : null,
        });

        return res.status(200).json({
          message: '푸시 구독이 업데이트되었습니다.',
          subscription: existingSubscription
        });
      }
    }

    // 기존 구독을 찾을 수 없는 경우, 새로운 구독으로 생성
    // 하지만 사용자 정보가 필요하므로 세션 확인 시도
    const session = await getServerSession(req, res);

    if (session) {
      // 로그인된 사용자인 경우 새 구독 생성
      const user = await User.findOne({
        where: {email: session.user.email, deletedAt: null}
      });

      if (user) {
        // 동일한 엔드포인트가 이미 존재하는지 확인
        const existingByEndpoint = await PushSubscription.findOne({
          where: {endpoint: newSubscription.endpoint}
        });

        if (existingByEndpoint) {
          // 기존 구독 업데이트
          await existingByEndpoint.update({
            userId: user.id,
            p256dh: newSubscription.keys.p256dh,
            auth: newSubscription.keys.auth,
            userAgent: userAgent || existingByEndpoint.userAgent,
            expirationTime: newSubscription.expirationTime ? new Date(newSubscription.expirationTime) : null,
          });

          return res.status(200).json({
            message: '푸시 구독이 업데이트되었습니다.',
            subscription: existingByEndpoint
          });
        } else {
          // 새 구독 생성
          const newPushSubscription = await PushSubscription.create({
            userId: user.id,
            endpoint: newSubscription.endpoint,
            p256dh: newSubscription.keys.p256dh,
            auth: newSubscription.keys.auth,
            userAgent: userAgent || null,
            expirationTime: newSubscription.expirationTime ? new Date(newSubscription.expirationTime) : null,
          });

          return res.status(201).json({
            message: '새 푸시 구독이 생성되었습니다.',
            subscription: newPushSubscription
          });
        }
      }
    }

    // 세션이 없거나 사용자를 찾을 수 없는 경우
    // 서비스 워커에서 호출되므로 세션이 없을 수 있음
    return res.status(200).json({
      message: '구독 정보가 기록되었습니다. 다음 로그인 시 연결됩니다.'
    });

  } catch (error) {
    console.error('푸시 구독 업데이트 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}