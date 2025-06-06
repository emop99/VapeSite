import {withAdminAuth} from '../../../../utils/adminAuth';
import SellerSite from '../../../../models/SellerSite';

async function sellerSiteHandler(req, res) {
  const {id} = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: '판매 사이트 ID가 필요합니다.'
    });
  }

  switch (req.method) {
    case 'GET':
      return getSellerSite(req, res, id);
    case 'PUT':
      return updateSellerSite(req, res, id);
    case 'DELETE':
      return deleteSellerSite(req, res, id);
    default:
      return res.status(405).json({
        success: false,
        message: '허용되지 않는 메소드입니다.'
      });
  }
}

// 특정 판매 사이트 조회
async function getSellerSite(req, res, id) {
  try {
    const sellerSite = await SellerSite.findByPk(id);

    if (!sellerSite) {
      return res.status(404).json({
        success: false,
        message: '판매 사이트를 찾을 수 없습니다.'
      });
    }

    return res.status(200).json({
      success: true,
      data: sellerSite
    });
  } catch (error) {
    console.error('판매 사이트 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

// 판매 사이트 수정
async function updateSellerSite(req, res, id) {
  try {
    const {name, siteUrl} = req.body;

    // 필수 값 검증
    if (!name || !siteUrl) {
      return res.status(400).json({
        success: false,
        message: '사이트 이름과 URL은 필수 항목입니다.'
      });
    }

    // 판매 사이트 존재 여부 확인
    const sellerSite = await SellerSite.findByPk(id);
    if (!sellerSite) {
      return res.status(404).json({
        success: false,
        message: '판매 사이트를 찾을 수 없습니다.'
      });
    }

    // 중복 이름 확인 (자신 제외)
    if (name !== sellerSite.name) {
      const existingSite = await SellerSite.findOne({
        where: {name}
      });

      if (existingSite) {
        return res.status(409).json({
          success: false,
          message: '이미 동일한 이름의 판매 사이트가 존재합니다.'
        });
      }
    }

    // 판매 사이트 정보 업데이트
    await sellerSite.update({
      name,
      siteUrl
    });

    return res.status(200).json({
      success: true,
      message: '판매 사이트 정보가 성공적으로 수정되었습니다.',
      data: sellerSite
    });
  } catch (error) {
    console.error('판매 사이트 수정 오류:', error);

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

// 판매 사이트 삭제
async function deleteSellerSite(req, res, id) {
  try {
    // 판매 사이트 존재 여부 확인
    const sellerSite = await SellerSite.findByPk(id);
    if (!sellerSite) {
      return res.status(404).json({
        success: false,
        message: '판매 사이트를 찾을 수 없습니다.'
      });
    }

    // 판매 사이트 삭제
    await sellerSite.destroy();

    return res.status(200).json({
      success: true,
      message: '판매 사이트가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('판매 사이트 삭제 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(sellerSiteHandler);
