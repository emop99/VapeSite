import {withAdminAuth} from '../../../../utils/adminAuth';
import {Company, PriceComparison, PriceHistory, Product, ProductCategory, Review} from "../../../../models";

async function productDetailHandler(req, res) {
  const {id} = req.query;

  if (!id) {
    return res.status(400).json({success: false, message: '상품 ID가 필요합니다.'});
  }

  switch (req.method) {
    case 'GET':
      return getProductDetail(req, res, id);
    case 'PUT':
      return updateProduct(req, res, id);
    case 'DELETE':
      return deleteProduct(req, res, id);
    case 'PATCH':
      return updateVisibility(req, res, id);
    default:
      return res.status(405).json({success: false, message: '허용되지 않는 메소드입니다.'});
  }
}

// 상품 상세 정보 조회
async function getProductDetail(req, res, id) {
  try {
    const product = await Product.findByPk(id, {
      include: [
        {model: ProductCategory, attributes: ['id', 'name']},
        {model: Company, attributes: ['id', 'name']}
      ]
    });

    if (!product) {
      return res.status(404).json({success: false, message: '상품을 찾을 수 없습니다.'});
    }

    return res.status(200).json({success: true, data: product});

  } catch (error) {
    console.error('상품 상세 조회 오류:', error);
    return res.status(500).json({success: false, message: '서버 오류가 발생했습니다.'});
  }
}

// 상품 정보 수정
async function updateProduct(req, res, id) {
  try {
    const productData = req.body;

    // 상품 존재 여부 확인
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({success: false, message: '상품을 찾을 수 없습니다.'});
    }

    // 상품 정보 업데이트
    await product.update(productData);

    return res.status(200).json({
      success: true,
      message: '상품 정보가 업데이트되었습니다.',
      data: product
    });

  } catch (error) {
    console.error('상품 업데이트 오류:', error);
    return res.status(500).json({success: false, message: '서버 오류가 발생했습니다.'});
  }
}

// 상품 노출 상태 변경 (PATCH 메소드로 처리)
async function updateVisibility(req, res, id) {
  try {
    const {isShow} = req.body;

    if (isShow === undefined) {
      return res.status(400).json({success: false, message: '노출 상태가 제공되지 않았습니다.'});
    }

    // 상품 존재 여부 확인
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({success: false, message: '상품을 찾을 수 없습니다.'});
    }

    // 노출 상태만 업데이트
    await product.update({isShow});

    return res.status(200).json({
      success: true,
      message: `상품이 ${isShow ? '노출' : '숨김'} 상태로 변경되었습니다.`,
      data: {id, isShow}
    });

  } catch (error) {
    console.error('상품 노출 상태 변경 오류:', error);
    return res.status(500).json({success: false, message: '서버 오류가 발생했습니다.'});
  }
}

// 상품 삭제
async function deleteProduct(req, res, id) {
  try {
    // 상품 존재 여부 확인
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({success: false, message: '상품을 찾을 수 없습니다.'});
    }

    await PriceComparison.destroy({where: {productId: id}}); // 가격 비교 정보 삭제
    await PriceHistory.destroy({where: {productId: id}}); // 가격 이력 삭제
    await Review.destroy({where: {productId: id}}); // 리뷰 정보 삭제

    // 상품 삭제
    await product.destroy();

    return res.status(200).json({
      success: true,
      message: '상품이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('상품 삭제 오류:', error);
    return res.status(500).json({success: false, message: '서버 오류가 발생했습니다.'});
  }
}

export default withAdminAuth(productDetailHandler);
