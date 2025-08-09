import {getServerSession} from 'next-auth/next';
import {Board, BoardNotificationPreference, User} from '../../../../models';

export default async function handler(req, res) {
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

    if (req.method === 'GET') {
      // 사용자의 게시판 알림 설정 조회
      const preferences = await BoardNotificationPreference.findAll({
        where: {userId: user.id},
        include: [{
          model: Board,
          attributes: ['id', 'name', 'slug', 'description']
        }]
      });

      // 모든 게시판 조회
      const allBoards = await Board.findAll({
        where: {isActive: true},
        attributes: ['id', 'name', 'slug', 'description']
      });

      // 설정되지 않은 게시판은 기본값(true)으로 처리
      const result = allBoards.map(board => {
        const preference = preferences.find(p => p.boardId === board.id);
        return {
          boardId: board.id,
          boardName: board.name,
          boardSlug: board.slug,
          boardDescription: board.description,
          enabled: preference ? preference.enabled : false,
          hasPreference: !!preference
        };
      });

      return res.status(200).json({
        message: '게시판 알림 설정을 조회했습니다.',
        preferences: result
      });
    }

    if (req.method === 'POST') {
      // 게시판 알림 설정 업데이트
      const {boardId, enabled} = req.body;

      if (!boardId || typeof enabled !== 'boolean') {
        return res.status(400).json({
          message: '게시판 ID와 알림 활성화 여부가 필요합니다.'
        });
      }

      // 게시판 존재 확인
      const board = await Board.findOne({
        where: {id: boardId, isActive: true}
      });

      if (!board) {
        return res.status(404).json({message: '게시판을 찾을 수 없습니다.'});
      }

      // 기존 설정 확인
      const existingPreference = await BoardNotificationPreference.findOne({
        where: {userId: user.id, boardId}
      });

      if (existingPreference) {
        // 기존 설정 업데이트
        await existingPreference.update({enabled});
        return res.status(200).json({
          message: '게시판 알림 설정이 업데이트되었습니다.',
          preference: {
            boardId,
            boardName: board.name,
            enabled
          }
        });
      } else {
        // 새 설정 생성
        const newPreference = await BoardNotificationPreference.create({
          userId: user.id,
          boardId,
          enabled
        });

        return res.status(201).json({
          message: '게시판 알림 설정이 생성되었습니다.',
          preference: {
            boardId,
            boardName: board.name,
            enabled
          }
        });
      }
    }

    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  } catch (error) {
    console.error('게시판 알림 설정 처리 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}