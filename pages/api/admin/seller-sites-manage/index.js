import {withAdminAuth} from '../../../../utils/adminAuth';
import SellerSite from '../../../../models/SellerSite';

async function sellerSitesHandler(req, res) {
  switch (req.method) {
    case 'GET':
      return getAllSellerSites(req, res);
    case 'POST':
      return createSellerSite(req, res);
    default:
      return res.status(405).json({
        success: false,
        message: '허용되지 않는 메소드입니다.'
      });
  }
}

// 모든 판매 사이트 조회
async function getAllSellerSites(req, res) {
  try {
    // 페이지네이션 처리
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const {Op} = require('sequelize');

    // 검색 쿼리 처리
    const searchQuery = req.query.search || '';
    const whereClause = searchQuery
      ? {
        [Op.or]: [
          {name: {[Op.like]: `%${searchQuery}%`}},
          {siteUrl: {[Op.like]: `%${searchQuery}%`}}
        ]
      }
      : {};

    // 판매 사이트 목록과 총 개수 조회
    const {count, rows} = await SellerSite.findAndCountAll({
      where: whereClause,
      order: [['id', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      data: {
        sellerSites: rows,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        limit
      }
    });
  } catch (error) {
    console.error('판매 사이트 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

// 새 판매 사이트 생성
async function createSellerSite(req, res) {
  try {
    const {name, siteUrl} = req.body;

    // 필수 값 검증
    if (!name || !siteUrl) {
      return res.status(400).json({
        success: false,
        message: '사이트 이름과 URL은 필수 항목입니다.'
      });
    }

    // 중복 확인
    const existingSite = await SellerSite.findOne({
      where: {name}
    });

    if (existingSite) {
      return res.status(409).json({
        success: false,
        message: '이미 동일한 이름의 판매 사이트가 존재합니다.'
      });
    }

    // 새 판매 사이트 생성
    const newSellerSite = await SellerSite.create({
      name,
      siteUrl
    });

    return res.status(201).json({
      success: true,
      message: '판매 사이트가 성공적으로 추가되었습니다.',
      data: newSellerSite
    });
  } catch (error) {
    console.error('판매 사이트 생성 오류:', error);

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `유효성 검사 오류: ${validationErrors}`
      });
    }

    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(sellerSitesHandler);
