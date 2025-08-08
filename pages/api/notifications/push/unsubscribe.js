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

  const {endpoint} = req.body;

  if (!endpoint) {
    return res.status(400).json({message: '구독 엔드포인트가 필요합니다.'});
  }

  try {
    // 사용자 정보 조회
    const user = await User.findOne({
      where: {email: session.user.email, deletedAt: null}
    });
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 구독 정보 조회
    const subscription = await PushSubscription.findOne({
      where: {
        endpoint,
        userId: user.id
      }
    });

    if (!subscription) {
      return res.status(404).json({message: '구독 정보를 찾을 수 없습니다.'});
    }

    // 구독 삭제
    await subscription.destroy();

    return res.status(200).json({
      message: '푸시 알림 구독이 취소되었습니다.'
    });
  } catch (error) {
    console.error('푸시 알림 구독 취소 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}