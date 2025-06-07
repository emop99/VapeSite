import {withAdminAuth} from '../../../../utils/adminAuth';
import Product from '../../../../models/Product';

async function bulkActionHandler(req, res) {
  // POST 요청만 처리
  if (req.method !== 'POST') {
    return res.status(405).json({success: false, message: '허용되지 않는 메서드입니다.'});
  }

  const {action, productIds, company} = req.body;

  // 필수 파라미터 확인
  if (!action || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: '유효하지 않은 요청입니다. action과 productIds 배열이 필요합니다.',
    });
  }

  const result = {
    success: 0,
    failed: 0,
    errors: []
  };

  try {
    // 작업 유형에 따른 처리
    switch (action) {
      case 'show':
        // 노출 처리
        return showProducts(req, res, productIds, result);
      case 'hide':
        // 숨김 처리
        return hideProducts(req, res, productIds, result);
      case 'delete':
        // 삭제 처리
        return deleteProducts(req, res, productIds, result);
      default:
        // 회사(제조사) 변경
        return updateCompany(req, res, productIds, company, result);
    }
  } catch (error) {
    console.error('일괄 작업 처리 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 상품 노출 처리
async function showProducts(req, res, productIds, result) {
  try {
    for (const id of productIds) {
      try {
        await Product.update({isShow: true}, {where: {id}});
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({id, error: error.message});
      }
    }

    return res.status(200).json({
      success: true,
      message: '일괄 노출 처리가 완료되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('일괄 노출 처리 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 상품 숨김 처리
async function hideProducts(req, res, productIds, result) {
  try {
    for (const id of productIds) {
      try {
        await Product.update({isShow: false}, {where: {id}});
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({id, error: error.message});
      }
    }

    return res.status(200).json({
      success: true,
      message: '일괄 숨김 처리가 완료되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('일괄 숨김 처리 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 상품 삭제 처리
async function deleteProducts(req, res, productIds, result) {
  try {
    for (const id of productIds) {
      try {
        await Product.destroy({where: {id}});
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({id, error: error.message});
      }
    }

    return res.status(200).json({
      success: true,
      message: '일괄 삭제가 완료되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('일괄 삭제 처리 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}

// 상품 제조사 변경 처리
async function updateCompany(req, res, productIds, company, result) {
  try {
    if (!company && company !== 0) {
      return res.status(400).json({
        success: false,
        message: '제조사 정보가 필요합니다.',
      });
    }

    let companyId;

    // company가 이미 숫자형이거나 숫자 문자열인 경우 처리
    if (typeof company === 'number') {
      companyId = company;
    } else {
      // 문자열이나 기타 타입인 경우 parseInt 시도
      companyId = parseInt(company, 10);

      // 변환 실패 또는 NaN인 경우
      if (isNaN(companyId)) {
        return res.status(400).json({
          success: false,
          message: '유효한 제조사 ID를 입력해주세요. 숫자 형식이 필요합니다.'
        });
      }
    }

    // 이제 companyId는 항상 유효한 숫자
    for (const id of productIds) {
      try {
        await Product.update({companyId}, {where: {id}});
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({id, error: error.message});
      }
    }

    return res.status(200).json({
      success: true,
      message: '일괄 제조사 변경이 완료되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('일괄 제조사 변경 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}

export default withAdminAuth(bulkActionHandler);
