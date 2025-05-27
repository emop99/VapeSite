import User from '../../../models/User';
import crypto from 'crypto';

// SHA-256 해시 함수 (nextauth.js와 동일한 함수 사용)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export default async function handler(req, res) {
  // POST 요청만 처리
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '허용되지 않는 메소드입니다.' });
  }

  try {
    const { email, password, nickName } = req.body;

    // 필수 필드 검증
    if (!email || !password || !nickName) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '유효한 이메일 주소를 입력해주세요.' });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    // 닉네임 길이 검증
    if (nickName.length < 2 || nickName.length > 20) {
      return res.status(400).json({ message: '닉네임은 2자 이상 20자 이하여야 합니다.' });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
    }

    // 닉네임 중복 확인
    const existingNickname = await User.findOne({
      where: { nickName }
    });

    if (existingNickname) {
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = hashPassword(password);

    // 새 사용자 생성
    const newUser = await User.create({
      email,
      password: hashedPassword,
      nickName,
      grade: 'NORMAL',
      emailVerification: 0,
      emailVerificationAt: null,
      deletedAt: null
    });

    // 민감한 정보 제외하고 응답
    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      user: {
        id: newUser.id,
        email: newUser.email,
        nickName: newUser.nickName,
        grade: newUser.grade
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.' });
  }
}