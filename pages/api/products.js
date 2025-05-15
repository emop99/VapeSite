// 제품 API 라우트
import Product from '../../models/Product';

/**
 * 제품 API 핸들러
 * GET: 모든 제품 또는 필터링된 제품 목록 조회
 * POST: 새 제품 추가 (관리자 권한 필요)
 */
export default async function handler(req, res) {
  // HTTP 메소드에 따라 다른 처리
  switch (req.method) {
    case 'GET':
      return getProducts(req, res);
    default:
      return res.status(405).json({ error: '허용되지 않는 메소드' });
  }
}

/**
 * 제품 목록 조회
 * 쿼리 파라미터:
 * - brand: 브랜드로 필터링
 * - minPrice/maxPrice: 가격 범위로 필터링
 * - sort: 정렬 기준 (price_asc, price_desc, name)
 */
async function getProducts(req, res) {
  try {
    const { brand, minPrice, maxPrice, sort } = req.query;
    
    // 필터 조건 구성
    const where = {};
    if (brand) where.brand = brand;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.$gte = parseInt(minPrice);
      if (maxPrice) where.price.$lte = parseInt(maxPrice);
    }
    
    // 정렬 조건 구성
    let order = [];
    if (sort === 'price_asc') order.push(['price', 'ASC']);
    else if (sort === 'price_desc') order.push(['price', 'DESC']);
    else if (sort === 'name') order.push(['name', 'ASC']);
    else order.push(['price', 'ASC']); // 기본 정렬: 가격 오름차순
    
    // 제품 조회
    const products = await Product.findAll({
      where,
      order,
    });
    
    return res.status(200).json(products);
  } catch (error) {
    console.error('제품 조회 오류:', error);
    return res.status(500).json({ error: '제품 조회 중 오류가 발생했습니다.' });
  }
}