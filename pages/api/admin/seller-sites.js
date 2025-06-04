import {withAdminAuth} from '../../../utils/adminAuth';
import SellerSite from '../../../models/SellerSite';

async function sellerSitesHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: '허용되지 않는 메소드입니다.'
    });
  }

  try {
    const sellerSites = await SellerSite.findAll({
      attributes: ['id', 'name', 'siteUrl'],
      order: [['name', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: sellerSites
    });
  } catch (error) {
    console.error('판매자 사이트 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(sellerSitesHandler);
