// 제품 API 라우트
import Product from '../../models/Product';
import ProductCategory from '../../models/ProductCategory';
import Company from '../../models/Company';
import PriceComparison from '../../models/PriceComparison';
import SellerSite from '../../models/SellerSite';

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
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 항목 수 (기본값: 12)
 * - category: 카테고리로 필터링
 */
async function getProducts(req, res) {
  try {
    const { 
      brand, 
      minPrice, 
      maxPrice, 
      sort, 
      page = 1, 
      limit = 12,
      category 
    } = req.query;

    // 페이지네이션 파라미터 처리
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // 필터 조건 구성
    const where = {};
    if (brand) where.brand = brand;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.$gte = parseInt(minPrice);
      if (maxPrice) where.price.$lte = parseInt(maxPrice);
    }

    // 카테고리 필터링
    const include = [
      { 
        model: ProductCategory,
        ...(category ? { where: { name: category } } : {})
      },
      { model: Company },
      {
        model: PriceComparison,
        include: [{ model: SellerSite }],
        order: [['price', 'ASC']], // 가격 오름차순 정렬
        separate: true, // 별도의 쿼리로 실행하여 정렬이 적용되도록 함
      }
    ];

    // 정렬 조건 구성
    let order = [];
    // if (sort === 'price_asc') order.push(['price', 'ASC']);
    // else if (sort === 'price_desc') order.push(['price', 'DESC']);
    // else if (sort === 'name') order.push(['name', 'ASC']);
    // else order.push(['price', 'ASC']); // 기본 정렬: 가격 오름차순

    // 전체 제품 수 조회
    const count = await Product.count({
      where,
      include: category ? [{ model: ProductCategory, where: { name: category } }] : []
    });

    // 제품 조회 (페이지네이션 적용)
    const products = await Product.findAll({
      where,
      order,
      include,
      limit: limitNum,
      offset: offset
    });

    return res.status(200).json({
      products,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum)
      }
    });
  } catch (error) {
    console.error('제품 조회 오류:', error);
    return res.status(500).json({ error: '제품 조회 중 오류가 발생했습니다.' });
  }
}
