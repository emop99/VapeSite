import {Board, Post} from '../../../../models';

export default async function handler(req, res) {
  // 요청 메소드 확인
  if (req.method !== 'GET') {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }

  try {
    // 활성화된 게시판 목록 조회
    const boards = await Board.findAll({
      where: {
        isActive: true,
        deletedAt: null
      },
      order: [
        ['id', 'ASC']
      ],
      attributes: ['id', 'name', 'description', 'slug', 'isActive', 'createdAt', 'updatedAt']
    });

    // 게시판이 없는 경우 기본 게시판 생성
    if (boards.length === 0) {
      return res.status(200).json({});
    }

    // 각 게시판의 게시글 수 조회
    const boardsWithPostCount = await Promise.all(
      boards.map(async (board) => {
        const postCount = await Post.count({
          where: {
            boardId: board.id,
            deletedAt: null
          }
        });

        return {
          ...board.toJSON(),
          postCount
        };
      })
    );

    // 게시판 목록 반환 (게시글 수 포함)
    return res.status(200).json({boards: boardsWithPostCount});
  } catch (error) {
    console.error('게시판 목록 조회 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}
