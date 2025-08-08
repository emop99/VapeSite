import {getServerSession} from 'next-auth/next';
import {Comment, Notification, Post, User} from '../../../models';

export default async function handler(req, res) {
  // 요청 메소드에 따라 처리
  if (req.method === 'GET') {
    return getNotifications(req, res);
  } else if (req.method === 'PUT') {
    return markAsRead(req, res);
  } else {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }
}

// 알림 목록 조회
async function getNotifications(req, res) {
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

    // 페이지네이션 파라미터
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // 읽음 상태 필터
    const isRead = req.query.isRead === 'true' ? true :
      req.query.isRead === 'false' ? false : null;

    // 알림 타입 필터
    const type = ['comment', 'like', 'reply'].includes(req.query.type) ?
      req.query.type : null;

    // 필터 조건 구성
    const where = {
      userId: user.id
    };

    if (isRead !== null) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    // 알림 목록 조회
    const {count, rows: notifications} = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'nickName'],
        },
        {
          model: Post,
          attributes: ['id', 'title'],
        },
        {
          model: Comment,
          attributes: ['id', 'content'],
          required: false,
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // 읽지 않은 알림 수 조회
    const unreadCount = await Notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });

    // 결과 반환
    return res.status(200).json({
      notifications,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('알림 목록 조회 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}

// 알림 읽음 처리
async function markAsRead(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {id, all} = req.body;

  if (!id && !all) {
    return res.status(400).json({message: '알림 ID 또는 all 파라미터가 필요합니다.'});
  }

  try {
    // 사용자 정보 조회
    const user = await User.findOne({
      where: {email: session.user.email, deletedAt: null}
    });
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    if (all) {
      // 모든 알림 읽음 처리
      await Notification.update(
        {isRead: true},
        {where: {userId: user.id, isRead: false}}
      );
      return res.status(200).json({message: '모든 알림이 읽음 처리되었습니다.'});
    } else {
      // 특정 알림 읽음 처리
      const notification = await Notification.findOne({
        where: {id, userId: user.id}
      });

      if (!notification) {
        return res.status(404).json({message: '알림을 찾을 수 없습니다.'});
      }

      await notification.update({isRead: true});
      return res.status(200).json({message: '알림이 읽음 처리되었습니다.'});
    }
  } catch (error) {
    console.error('알림 읽음 처리 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}