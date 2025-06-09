import {withAdminAuth} from '../../../../utils/adminAuth';
import PriceComparisons from '../../../../models/PriceComparisons';
import Product from '../../../../models/Product';
import {sequelize} from '../../../../lib/db';
import {PriceHistory} from "../../../../models";

/**
 * 가격 비교 데이터 이관 API 핸들러
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 * @returns {Promise<void>}
 */
async function transferHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '허용되지 않는 메소드입니다.'
    });
  }

  // 트랜잭션 시작
  const transaction = await sequelize.transaction();

  try {
    const {targetProductId, comparisonIds, sourceProductId} = req.body;

    // 요청 데이터 검증
    if (!targetProductId || !comparisonIds || !sourceProductId || !Array.isArray(comparisonIds) || comparisonIds.length === 0 || sourceProductId.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '현재 상품 ID, 대상 상품 ID, 이관할 가격 비교 데이터 ID 데이터가 필요합니다.'
      });
    }

    // 원본 상품 존재 여부 확인
    const sourceProduct = await Product.findByPk(sourceProductId, {transaction});
    if (!sourceProduct) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '이관할 현재 상품이 존재하지 않습니다.'
      });
    }

    // 대상 상품 존재 여부 확인
    const targetProduct = await Product.findByPk(targetProductId, {transaction});
    if (!targetProduct) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '이관할 대상 상품이 존재하지 않습니다.'
      });
    }

    // 대상 상품 가격 비교 데이터가 존재하는지 확인
    const comparisonsToTransfer = await PriceComparisons.findAll({
      where: {
        id: comparisonIds
      },
      transaction
    });

    if (comparisonsToTransfer.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '이관할 가격 비교 데이터가 없습니다.'
      });
    }

    // 이관할 데이터 중에 대상 상품과 동일한 판매처 데이터가 있는지 확인
    for (const comparison of comparisonsToTransfer) {
      const existingComparison = await PriceComparisons.findOne({
        where: {
          productId: targetProductId,
          sellerId: comparison.sellerId
        },
        transaction
      });

      if (existingComparison) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `이미 동일한 판매처의 가격 비교 데이터가 존재합니다. (판매처 ID: ${comparison.sellerId})`
        });
      }
    }

    /*
     * 이관 전 최저가 가격 조회
     */
    // 원본 상품
    const sourceLowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: sourceProductId,
      },
      order: [['price', 'ASC']],
      transaction
    });
    // 대상 상품
    const targetLowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: targetProductId,
      },
      order: [['price', 'ASC']],
      transaction
    });

    // 가격 비교 데이터 이관
    const updatePromises = comparisonIds.map(id =>
      PriceComparisons.update(
        {productId: targetProductId},
        {where: {id: id}, transaction}
      )
    );

    await Promise.all(updatePromises);

    /*
     * 이관 후 최저가 가격 조회
     */
    // 원본 상품
    const updatedSourceLowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: sourceProductId,
      },
      order: [['price', 'ASC']],
      transaction
    });
    // 대상 상품
    const updatedTargetLowestPriceComparison = await PriceComparisons.findOne({
      where: {
        productId: targetProductId,
      },
      order: [['price', 'ASC']],
      transaction
    });

    /**
     * 가격 변동 이력 등록
     */
    // 원본 상품의 최저가 가격이 변경된 경우
    if (sourceLowestPriceComparison && updatedSourceLowestPriceComparison && sourceLowestPriceComparison.price !== updatedSourceLowestPriceComparison.price) {
      await PriceHistory.create({
        newPrice: updatedSourceLowestPriceComparison.price,
        oldPrice: sourceLowestPriceComparison.price,
        productId: sourceProductId,
        sellerId: updatedSourceLowestPriceComparison.sellerId,
        priceDifference: updatedSourceLowestPriceComparison.price - sourceLowestPriceComparison.price,
        percentageChange: ((updatedSourceLowestPriceComparison.price - sourceLowestPriceComparison.price) / sourceLowestPriceComparison.price) * 100
      }, {transaction});
    }
    // 대상 상품의 최저가 가격이 변경된 경우
    if (targetLowestPriceComparison && updatedTargetLowestPriceComparison && targetLowestPriceComparison.price !== updatedTargetLowestPriceComparison.price) {
      await PriceHistory.create({
        newPrice: updatedTargetLowestPriceComparison.price,
        oldPrice: targetLowestPriceComparison.price,
        productId: targetProductId,
        sellerId: updatedTargetLowestPriceComparison.sellerId,
        priceDifference: updatedTargetLowestPriceComparison.price - targetLowestPriceComparison.price,
        percentageChange: ((updatedTargetLowestPriceComparison.price - targetLowestPriceComparison.price) / targetLowestPriceComparison.price) * 100
      }, {transaction});
    }

    // 원본 상품 가격 비교 데이터가 존재 하는지
    const sourceComparisonCount = await PriceComparisons.count({
      where: {productId: sourceProductId},
      transaction
    });

    // 원본 상품 가격 비교 데이터가 존재하지 않는 경우
    if (sourceComparisonCount === 0) {
      // 숨김 상품 처리
      await Product.update(
        {isShow: false},
        {where: {id: sourceProductId}, transaction}
      );
    }

    // 트랜잭션 커밋
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: '가격 비교 데이터가 성공적으로 이관되었습니다.',
      count: comparisonIds.length,
      sourceComparisonCount
    });
  } catch (error) {
    // 오류 발생 시 트랜잭션 롤백
    await transaction.rollback();
    console.error('가격 비교 데이터 이관 오류:', error);

    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(transferHandler);
