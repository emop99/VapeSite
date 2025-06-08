import {withAdminAuth} from '../../../../../utils/adminAuth';
import {sequelize} from '../../../../../lib/db';

async function similarProductsHandler(req, res) {
  const {id} = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({success: false, message: '허용되지 않는 메소드입니다.'});
  }

  try {
    // vapesite.get_similar_products 프로시저 호출
    const result = await sequelize.query(
      'CALL vapesite.get_similar_products(:productId)',
      {
        replacements: {productId: id},
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json({
      success: true,
      products: result[0]
    });
  } catch (error) {
    console.error('유사 상품 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(similarProductsHandler);
