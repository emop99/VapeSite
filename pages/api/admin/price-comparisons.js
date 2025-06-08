import {withAdminAuth} from '../../../utils/adminAuth';
import PriceComparisons from '../../../models/PriceComparisons';
import SellerSite from '../../../models/SellerSite';
import Product from '../../../models/Product';
import {PriceHistory} from "../../../models";
import {sequelize} from '../../../lib/db'; // sequelize 인스턴스를 올바르게 가져옵니다.

async function priceComparisonsHandler(req, res) {
  switch (req.method) {
    case 'GET':
      return getPriceComparisons(req, res);
    case 'POST':
      return createPriceComparison(req, res);
    case 'PUT':
      return updatePriceComparison(req, res);
    case 'DELETE':
      return deletePriceComparison(req, res);
    default:
      return res.status(405).json({
        success: false,
        message: '허용되지 않는 메소드입니다.'
      });
  }
}

// 가격 비교 목록 조회
async function getPriceComparisons(req, res) {
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

    const comparisons = await PriceComparisons.findAll({
      where: {productId},
      include: [
        {
          model: SellerSite,
          attributes: ['id', 'name', 'siteUrl']
        }
      ],
      order: [['price', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: comparisons
    });
  } catch (error) {
    console.error('가격 비교 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

// 가격 비교 생성
async function createPriceComparison(req, res) {
  // 트랜잭션 시작
  const transaction = await sequelize.transaction();

  try {
    const {productId, sellerSiteId, price, sellerUrl} = req.body;

    // 필수 값 검증
    if (!productId || !sellerSiteId || !sellerUrl || price === undefined) {
      return res.status(400).json({
        success: false,
        message: '상품 ID, 판매자 사이트 ID, URL, 가격은 필수 항목입니다.'
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
    const sellerSite = await SellerSite.findByPk(sellerSiteId, {transaction});
    if (!sellerSite) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 판매자 사이트입니다.'
      });
    }

    // 동일한 상품, 판매자 조합이 이미 존재하는지 확인
    const existingComparison = await PriceComparisons.findOne({
      where: {
        productId,
        sellerId: sellerSiteId
      },
      transaction
    });

    if (existingComparison) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: '이미 동일한 판매자 사이트에 대한 가격 비교가 존재합니다.'
      });
    }

    // 현재 상품의 최저가 가격 조회
    const lowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: product.id,
      },
      order: [['price', 'ASC']],
      transaction
    });

    // 가격 비교 생성
    const newComparison = await PriceComparisons.create({
      productId,
      sellerId: sellerSiteId,
      price,
      sellerUrl,
    }, {transaction});

    // 수정 후 상품의 최저가 가격 조회
    const updatedLowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: product.id,
      },
      order: [['price', 'ASC']],
      transaction
    });

    if (lowestPriceComparison && updatedLowestPriceComparison && lowestPriceComparison.price !== updatedLowestPriceComparison.price) {
      // 가격 변동 이력 등록
      await PriceHistory.create({
        newPrice: updatedLowestPriceComparison.price,
        oldPrice: lowestPriceComparison.price,
        productId: product.id,
        sellerId: updatedLowestPriceComparison.sellerId,
        priceDifference: updatedLowestPriceComparison.price - lowestPriceComparison.price,
        percentageChange: ((updatedLowestPriceComparison.price - lowestPriceComparison.price) / lowestPriceComparison.price) * 100
      }, {transaction});
    }

    // 생성된 가격 비교 정보 조회
    const comparison = await PriceComparisons.findByPk(newComparison.id, {
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
      message: '가격 비교가 성공적으로 추가되었습니다.',
      data: comparison
    });
  } catch (error) {
    // 오류 발생 시 트랜잭션 롤백
    await transaction.rollback();

    console.error('가격 비교 생성 오류:', error);

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

// 가격 비교 수정
async function updatePriceComparison(req, res) {
  // 트랜잭션 시작
  const transaction = await sequelize.transaction();

  try {
    const {id, sellerSiteId, price, sellerUrl, productId} = req.body;

    // 필수 값 검증
    if (!id || !sellerSiteId || !sellerUrl || price === undefined || !productId) {
      return res.status(400).json({
        success: false,
        message: 'ID, 판매자 사이트 ID, URL, 가격, 상품 ID는 필수 항목입니다.'
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

    // 가격 비교 존재 여부 확인
    const comparison = await PriceComparisons.findByPk(id, {transaction});
    if (!comparison) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '가격 비교 정보를 찾을 수 없습니다.'
      });
    }

    // 판매자 사이트 존재 여부 확인
    const sellerSite = await SellerSite.findByPk(sellerSiteId, {transaction});
    if (!sellerSite) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '존재하지 않는 판매자 사이트입니다.'
      });
    }

    // 동일한 판매자 사이트 ID로 변경하려는 경우, 다른 레코드와 중복되는지 확인
    if (sellerSiteId !== comparison.sellerId) {
      const existingComparison = await PriceComparisons.findOne({
        where: {
          productId: comparison.productId,
          sellerId: sellerSiteId
        },
        transaction
      });

      if (existingComparison && existingComparison.id !== id) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: '이미 동일한 판매자 사이트에 대한 가격 비교가 존재합니다.'
        });
      }
    }

    // 현재 상품의 최저가 가격 조회
    const lowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: product.id,
      },
      order: [['price', 'ASC']],
      transaction
    });

    // 가격 비교 수정
    await comparison.update({
      sellerId: sellerSiteId,
      price,
      sellerUrl,
    }, {transaction});

    // 수정 후 상품의 최저가 가격 조회
    const updatedLowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: product.id,
      },
      order: [['price', 'ASC']],
      transaction
    });

    if (lowestPriceComparison && updatedLowestPriceComparison && lowestPriceComparison.price !== updatedLowestPriceComparison.price) {
      // 가격 변동 이력 등록
      await PriceHistory.create({
        newPrice: updatedLowestPriceComparison.price,
        oldPrice: lowestPriceComparison.price,
        productId: product.id,
        sellerId: updatedLowestPriceComparison.sellerId,
        priceDifference: updatedLowestPriceComparison.price - lowestPriceComparison.price,
        percentageChange: ((updatedLowestPriceComparison.price - lowestPriceComparison.price) / lowestPriceComparison.price) * 100
      }, {transaction});
    }

    // 수정된 가격 비교 정보 조회
    const updatedComparison = await PriceComparisons.findByPk(id, {
      include: [
        {
          model: SellerSite,
          attributes: ['id', 'name', 'siteUrl']
        }
      ],
      transaction
    });

    // 트랜잭션 커밋
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: '가격 비교가 성공적으로 수정되었습니다.',
      data: updatedComparison
    });
  } catch (error) {
    // 오류 발생 시 트랜잭션 롤백
    await transaction.rollback();

    console.error('가격 비교 수정 오류:', error);

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

// 가격 비교 삭제
async function deletePriceComparison(req, res) {
  try {
    const {id} = req.body;

    // 필수 값 검증
    if (!id) {
      return res.status(400).json({
        success: false,
        message: '가격 비교 ID는 필수 항목입니다.'
      });
    }

    // 가격 비교 존재 여부 확인
    const comparison = await PriceComparisons.findByPk(id);
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: '가격 비교 정보를 찾을 수 없습니다.'
      });
    }

    // 트랜잭션 시작
    const transaction = await sequelize.transaction();
    const productId = comparison.productId;

    // 현재 상품의 최저가 가격 조회
    const lowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: productId,
      },
      order: [['price', 'ASC']],
      transaction
    });

    // 가격 비교 삭제
    await comparison.destroy({
      transaction
    });

    // 수정 후 상품의 최저가 가격 조회
    const updatedLowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: productId,
      },
      order: [['price', 'ASC']],
      transaction
    });

    if (lowestPriceComparison && updatedLowestPriceComparison && lowestPriceComparison.price !== updatedLowestPriceComparison.price) {
      // 가격 변동 이력 등록
      await PriceHistory.create({
        newPrice: updatedLowestPriceComparison.price,
        oldPrice: lowestPriceComparison.price,
        productId: productId,
        sellerId: updatedLowestPriceComparison.sellerId,
        priceDifference: updatedLowestPriceComparison.price - lowestPriceComparison.price,
        percentageChange: ((updatedLowestPriceComparison.price - lowestPriceComparison.price) / lowestPriceComparison.price) * 100
      }, {transaction});
    }

    // 트랜잭션 커밋
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: '가격 비교가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    // 오류 발생 시 트랜잭션 롤백
    await transaction.rollback();

    console.error('가격 비교 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(priceComparisonsHandler);
