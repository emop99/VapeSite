import {withAdminAuth} from '../../../utils/adminAuth';
import {PriceHistory} from '../../../models';
import Product from '../../../models/Product';
import SellerSite from '../../../models/SellerSite';
import {sequelize} from '../../../lib/db';

async function priceHistoryHandler(req, res) {
  switch (req.method) {
    case 'GET':
      return getPriceHistory(req, res);
    case 'POST':
      return createPriceHistory(req, res);
    case 'PUT':
      return updatePriceHistory(req, res);
    case 'DELETE':
      return deletePriceHistory(req, res);
    default:
      return res.status(405).json({
        success: false,
        message: '허용되지 않는 메소드입니다.'
      });
  }
}

// 가격 변동 이력 조회
async function getPriceHistory(req, res) {
  try {
    const {productId} = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '상품 ID가 필요합니다.'
      });
    }

    // 상품 존재 여부 확인
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 상품입니다.'
      });
    }

    const priceHistory = await PriceHistory.findAll({
      where: {productId},
      include: [
        {
          model: SellerSite,
          attributes: ['id', 'name', 'siteUrl']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: priceHistory
    });
  } catch (error) {
    console.error('가격 변동 이력 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

// 가격 변동 이력 생성
async function createPriceHistory(req, res) {
  // 트랜잭션 시작
  const transaction = await sequelize.transaction();

  try {
    const {productId, sellerId, oldPrice, newPrice} = req.body;

    // 필수 값 검증
    if (!productId || !sellerId || oldPrice === undefined || newPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: '상품 ID, 판매자 ID, 이전 가격, 새 가격은 필수 항목입니다.'
      });
    }

    // 상품 존재 여부 확인
    const product = await Product.findByPk(productId, {transaction});
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 상품입니다.'
      });
    }

    // 판매자 사이트 존재 여부 확인
    const sellerSite = await SellerSite.findByPk(sellerId, {transaction});
    if (!sellerSite) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 판매자 사이트입니다.'
      });
    }

    // 가격 차이 및 백분율 변화 계산
    const priceDifference = newPrice - oldPrice;
    const percentageChange = oldPrice > 0 ? (priceDifference / oldPrice) * 100 : 0;

    // 가격 변동 이력 생성
    const newPriceHistory = await PriceHistory.create({
      productId,
      sellerId,
      oldPrice,
      newPrice,
      priceDifference,
      percentageChange
    }, {transaction});

    // 생성된 가격 변동 이력 조회
    const priceHistory = await PriceHistory.findByPk(newPriceHistory.id, {
      include: [
        {
          model: SellerSite,
          attributes: ['id', 'name', 'siteUrl']
        }
      ],
      transaction
    });

    // 모든 작업이 성공적으로 완료되면 트랜잭션 커밋
    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: '가격 변동 이력이 성공적으로 추가되었습니다.',
      data: priceHistory
    });
  } catch (error) {
    // 오류 발생 시 트랜잭션 롤백
    await transaction.rollback();

    console.error('가격 변동 이력 생성 오류:', error);

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

// 가격 변동 이력 수정
async function updatePriceHistory(req, res) {
  // 트랜잭션 시작
  const transaction = await sequelize.transaction();

  try {
    const {id, productId, sellerId, oldPrice, newPrice} = req.body;

    // 필수 값 검증
    if (!id || !productId || !sellerId || oldPrice === undefined || newPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'ID, 상품 ID, 판매자 ID, 이전 가격, 새 가격은 필수 항목입니다.'
      });
    }

    // 가격 변동 이력 존재 여부 확인
    const priceHistory = await PriceHistory.findByPk(id, {transaction});
    if (!priceHistory) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '가격 변동 이력을 찾을 수 없습니다.'
      });
    }

    // 상품 존재 여부 확인
    const product = await Product.findByPk(productId, {transaction});
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 상품입니다.'
      });
    }

    // 판매자 사이트 존재 여부 확인
    const sellerSite = await SellerSite.findByPk(sellerId, {transaction});
    if (!sellerSite) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 판매자 사이트입니다.'
      });
    }

    // 가격 차이 및 백분율 변화 계산
    const priceDifference = newPrice - oldPrice;
    const percentageChange = oldPrice > 0 ? (priceDifference / oldPrice) * 100 : 0;

    // 가격 변동 이력 수정
    await priceHistory.update({
      productId,
      sellerId,
      oldPrice,
      newPrice,
      priceDifference,
      percentageChange
    }, {transaction});

    // 수정된 가격 변동 이력 조회
    const updatedPriceHistory = await PriceHistory.findByPk(id, {
      include: [
        {
          model: SellerSite,
          attributes: ['id', 'name', 'siteUrl']
        }
      ],
      transaction
    });

    // 모든 작업이 성공적으로 완료되면 트랜잭션 커밋
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: '가격 변동 이력이 성공적으로 수정되었습니다.',
      data: updatedPriceHistory
    });
  } catch (error) {
    // 오류 발생 시 트랜잭션 롤백
    await transaction.rollback();

    console.error('가격 변동 이력 수정 오류:', error);

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

// 가격 변동 이력 삭제
async function deletePriceHistory(req, res) {
  try {
    const {id} = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID는 필수 항목입니다.'
      });
    }

    // 가격 변동 이력 존재 여부 확인
    const priceHistory = await PriceHistory.findByPk(id);
    if (!priceHistory) {
      return res.status(404).json({
        success: false,
        message: '가격 변동 이력을 찾을 수 없습니다.'
      });
    }

    // 가격 변동 이력 삭제
    await priceHistory.destroy();

    return res.status(200).json({
      success: true,
      message: '가격 변동 이력이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('가격 변동 이력 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(priceHistoryHandler);