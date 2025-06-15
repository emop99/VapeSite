import {Board} from '../../../../models';

export default async function handler(req, res) {
  // 요청 메소드 확인
  if (req.method !== 'GET') {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }

  const {slug} = req.query;

  if (!slug) {
    return res.status(400).json({message: '게시판 슬러그가 필요합니다.'});
  }

  try {
    // 슬러그로 게시판 조회
    const board = await Board.findOne({
      where: {
        slug: slug,
        isActive: true,
        deletedAt: null
      },
      attributes: ['id', 'name', 'description', 'slug', 'isActive', 'createdAt', 'updatedAt']
    });

    // 게시판이 없는 경우
    if (!board) {
      return res.status(404).json({message: '게시판을 찾을 수 없습니다.'});
    }

    // 게시판 정보 반환
    return res.status(200).json({board});
  } catch (error) {
    console.error('게시판 조회 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}