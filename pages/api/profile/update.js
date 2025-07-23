import {getServerSession} from 'next-auth/next';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }

  try {
    const session = await getServerSession(req, res);

    if (!session) {
      return res.status(401).json({message: '로그인이 필요합니다.'});
    }

    const user = await User.findOne({
      where: {
        email: session.user.email,
        deletedAt: null
      }
    });

    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    const {nickName} = req.body;

    // Validate nickname
    if (!nickName || nickName.trim() === '') {
      return res.status(400).json({message: '닉네임을 입력해주세요.'});
    }

    if (nickName.length < 2 || nickName.length > 20) {
      return res.status(400).json({message: '닉네임은 2자 이상 20자 이하여야 합니다.'});
    }

    // 중복 닉네임 확인
    const existingUser = await User.findOne({
      where: {
        nickName: nickName,
        deletedAt: null
      }
    });

    if (existingUser) {
      return res.status(400).json({message: '이미 사용 중인 닉네임입니다.'});
    }

    await User.update(
      {nickName: nickName},
      {
        where: {
          id: user.id,
          deletedAt: null
        }
      }
    );

    return res.status(200).json({message: '닉네임이 성공적으로 업데이트되었습니다.'});
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}