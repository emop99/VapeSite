// 카테고리 API 라우트
import ProductCategory from '../../models/ProductCategory';

/**
 * 카테고리 API 핸들러
 * GET: 모든 카테고리 조회
 */
export default async function handler(req, res) {
  // HTTP 메소드에 따라 다른 처리
  switch (req.method) {
    case 'GET':
      return getCategories(req, res);
    default:
      return res.status(405).json({ error: '허용되지 않는 메소드' });
  }
}

/**
 * 모든 카테고리 조회
 */
async function getCategories(req, res) {
  try {
    // 모든 카테고리 조회
    const categories = await ProductCategory.findAll({
      order: [['name', 'ASC']], // 이름 오름차순 정렬
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    return res.status(500).json({ error: '카테고리 조회 중 오류가 발생했습니다.' });
  }
}