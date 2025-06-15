import {getServerSession} from 'next-auth/next';
import {Comment, Like, User} from '../../../models';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }

  const session = await getServerSession(req, res);
  if (!session || !session.user) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {commentId, action} = req.body;
  if (!commentId || !['like', 'unlike'].includes(action)) {
    return res.status(400).json({message: '잘못된 요청입니다.'});
  }

  try {
    // 사용자 정보 조회
    const user = await User.findOne({
      where: {email: session.user.email, deletedAt: null}
    });
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 댓글 존재 확인
    const comment = await Comment.findOne({where: {id: commentId}});
    if (!comment) {
      return res.status(404).json({message: '댓글을 찾을 수 없습니다.'});
    }

    const likeWhere = {
      userId: user.id,
      targetType: 'comment',
      targetId: commentId
    };

    if (action === 'like') {
      // 이미 좋아요가 있으면 무시
      await Like.findOrCreate({where: likeWhere});
    } else if (action === 'unlike') {
      await Like.destroy({where: likeWhere});
    }

    // 최신 좋아요 수와 내 좋아요 여부 반환
    const likeCount = await Like.count({
      where: {targetType: 'comment', targetId: commentId}
    });
    const likedByUser = !!(await Like.findOne({where: likeWhere}));

    return res.status(200).json({likeCount, likedByUser});
  } catch (error) {
    console.error('댓글 좋아요 처리 오류:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}
