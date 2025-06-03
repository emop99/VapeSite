// 제품 API 라우트
import Product from '../../models/Product';
import ProductCategory from '../../models/ProductCategory';
import Company from '../../models/Company';
import PriceComparisons from '../../models/PriceComparisons';
import {Op} from "sequelize";

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
      return res.status(405).json({error: '허용되지 않는 메소드'});
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
 * - search: 검색어 (제품명, 회사명, 판매사이트명 검색)
 */
async function getProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search
    } = req.query;

    // 페이지네이션 파라미터 처리
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // 필터 조건 구성
    const where = {};

    // 조건 처리
    const {Op} = require('sequelize');

    // 카테고리 필터링
    const include = [
      {
        model: ProductCategory,
        attributes: ['id', 'name', 'createdAt', 'updatedAt'],
        required: true
      },
      {
        model: Company,
        attributes: ['id', 'name', 'createdAt'],
        required: true
      },
      {
        model: PriceComparisons,
        attributes: ['productId', 'sellerId', 'sellerUrl', 'price', 'createdAt', 'updatedAt'],
        required: true
      }
    ];

    // 기본 조건: PriceComparisons.price > 0
    const priceCondition = {'$PriceComparisons.price$': {[Op.gt]: 0}};
    // 기본 조건: 제품이 노출되는 경우
    const isShowCondition = {isShow: true};

    // 필터링 조건 구성
    if (category && search) {
      // 카테고리와 검색어가 모두 있는 경우 (SQL 쿼리와 동일한 구조)
      where[Op.and] = [
        isShowCondition,
        priceCondition,
        {'$ProductCategory.name$': category},
        {
          [Op.or]: [
            {'visibleName': {[Op.like]: `%${search}%`}},
            {'$Company.name$': {[Op.like]: `%${search}%`}}
          ]
        }
      ];
    } else if (category) {
      // 카테고리만 있는 경우
      where[Op.and] = [
        isShowCondition,
        priceCondition,
        {'$ProductCategory.name$': category}
      ];
    } else if (search) {
      // 검색어만 있는 경우
      where[Op.and] = [
        isShowCondition,
        priceCondition,
        {
          [Op.or]: [
            {'visibleName': {[Op.like]: `%${search}%`}},
            {'$Company.name$': {[Op.like]: `%${search}%`}}
          ]
        }
      ];
    } else {
      // 필터가 없는 경우에 기본 조건만 적용
      where[Op.and] = [priceCondition, priceCondition];
    }

    // 정렬 조건 구성
    let order = [];

    // 전체 제품 수 조회
    const count = await Product.count({
      where,
      include,
      subQuery: false,
      distinct: true,
    });

    // 제품 조회 (페이지네이션 적용)
    const products = await Product.findAll({
      where,
      order,
      include,
      limit: limitNum,
      offset: offset,
      subQuery: false,
      group: ['Product.id']
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
    return res.status(500).json({error: '제품 조회 중 오류가 발생했습니다.'});
  }
}
