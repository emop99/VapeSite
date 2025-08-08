import {getServerSession} from 'next-auth/next';
import {NotificationSettings, User} from '../../../models';

export default async function handler(req, res) {
  // 요청 메소드에 따라 처리
  if (req.method === 'GET') {
    return getSettings(req, res);
  } else if (req.method === 'PUT') {
    return updateSettings(req, res);
  } else {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }
}

// 알림 설정 조회
async function getSettings(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  try {
    // 사용자 정보 조회
    const user = await User.findOne({
      where: {email: session.user.email, deletedAt: null}
    });
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 알림 설정 조회
    let settings = await NotificationSettings.findOne({
      where: {userId: user.id}
    });

    // 설정이 없으면 기본 설정으로 생성
    if (!settings) {
      settings = await NotificationSettings.create({
        userId: user.id,
        commentEnabled: true,
        likeEnabled: true,
        replyEnabled: true,
        emailEnabled: false,
        pushEnabled: true
      });
    }

    // 결과 반환
    return res.status(200).json({settings});
  } catch (error) {
    console.error('알림 설정 조회 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}

// 알림 설정 업데이트
async function updateSettings(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {
    commentEnabled,
    likeEnabled,
    replyEnabled,
    emailEnabled,
    pushEnabled
  } = req.body;

  // 필수 필드 확인
  if (
    commentEnabled === undefined &&
    likeEnabled === undefined &&
    replyEnabled === undefined &&
    emailEnabled === undefined &&
    pushEnabled === undefined
  ) {
    return res.status(400).json({message: '변경할 설정이 필요합니다.'});
  }

  try {
    // 사용자 정보 조회
    const user = await User.findOne({
      where: {email: session.user.email, deletedAt: null}
    });
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 알림 설정 조회
    let settings = await NotificationSettings.findOne({
      where: {userId: user.id}
    });

    // 설정이 없으면 기본 설정으로 생성
    if (!settings) {
      settings = await NotificationSettings.create({
        userId: user.id,
        commentEnabled: true,
        likeEnabled: true,
        replyEnabled: true,
        emailEnabled: false,
        pushEnabled: true
      });
    }

    // 설정 업데이트
    const updateData = {};
    if (commentEnabled !== undefined) updateData.commentEnabled = commentEnabled;
    if (likeEnabled !== undefined) updateData.likeEnabled = likeEnabled;
    if (replyEnabled !== undefined) updateData.replyEnabled = replyEnabled;
    if (emailEnabled !== undefined) updateData.emailEnabled = emailEnabled;
    if (pushEnabled !== undefined) updateData.pushEnabled = pushEnabled;

    await settings.update(updateData);

    // 업데이트된 설정 조회
    const updatedSettings = await NotificationSettings.findOne({
      where: {userId: user.id}
    });

    // 결과 반환
    return res.status(200).json({
      message: '알림 설정이 업데이트되었습니다.',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('알림 설정 업데이트 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}