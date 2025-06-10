// 단일 제품 API 라우트
import Product from '../../../models/Product';
import Company from '../../../models/Company';
import PriceComparisons from '../../../models/PriceComparisons';
import SellerSite from '../../../models/SellerSite';
import PriceHistory from '../../../models/PriceHistory';
import Review from '../../../models/Review';
import User from '../../../models/User';
import WishList from '../../../models/WishList';
import {sequelize} from '../../../lib/db';
import {getSession} from 'next-auth/react'; // 세션 정보를 얻기 위해 추가

/**
 * 단일 제품 API 핸들러
 * GET: 제품 상세 정보 조회
 * PUT: 제품 정보 업데이트 (관리자 권한 필요)
 * DELETE: 제품 삭제 (관리자 권한 필요)
 */
export default async function handler(req, res) {
  // 제품 ID 가져오기
  const {id} = req.query;
  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({error: '올바른 제품 정보가 필요합니다.'});
  }

  // HTTP 메소드에 따라 다른 처리
  switch (req.method) {
    case 'GET':
      return getProduct(req, res, id);
    default:
      return res.status(405).json({error: '허용되지 않는 메소드'});
  }
}

/**
 * 제품 상세 정보 조회
 */
async function getProduct(req, res, id) {
  try {
    // 세션에서 사용자 ID 가져오기
    const session = await getSession({req});
    const userId = session?.user?.id;

    // 제품 조회 (제조사 정보 포함)
    const product = await Product.findOne({
      where: {
        id: id,
        isShow: true
      },
      include: [{model: Company}],
    });

    if (!product) {
      return res.status(400).json({error: '제품을 찾을 수 없습니다.'});
    }

    // 가격 비교 정보 조회 (판매처 정보 포함)
    const priceComparisons = await PriceComparisons.findAll({
      where: {productId: id},
      include: [{model: SellerSite}],
      order: [['price', 'ASC']], // 가격 오름차순 정렬
    });

    // 가격 변동 이력 조회 (최근 10개)
    const priceHistory = await PriceHistory.findAll({
      where: {productId: id},
      include: [{model: SellerSite}],
      order: [['createdAt', 'DESC']], // 최신순 정렬
      limit: 10,
    });

    // 리뷰 조회 (유저 정보 포함)
    const reviews = await Review.findAll({
      where: {productId: id},
      include: [{
        model: User,
        attributes: ['id', 'nickName', 'grade'] // 필요한 유저 정보만 가져오기
      }],
      order: [['createdAt', 'DESC']], // 최신순 정렬
    });

    // 연관 상품 검색 - get_similar_products 프로시저 호출
    const [similarProducts] = await sequelize.query(
      'CALL vapesite.get_similar_products(:productId)',
      {
        replacements: {productId: id},
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // 찜 목록 여부 확인
    let isWished = false;
    if (userId) {
      const wish = await WishList.findOne({
        where: {
          userId: userId,
          productId: id
        }
      });
      isWished = !!wish; // 찜 목록에 있으면 true, 없으면 false
    }

    // 조회수 증가 처리
    await product.increment('viewCount');

    // 평균 평점 계산
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // 응답 데이터 구성
    const responseData = {
      ...product.toJSON(),
      priceComparisons,
      priceHistory,
      reviews,
      averageRating,
      similarProducts,
      isWished,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('제품 조회 오류:', error);
    return res.status(500).json({error: '제품 조회 중 오류가 발생했습니다.'});
  }
}
