import {withAdminAuth} from '../../../../utils/adminAuth';
import {Company} from '../../../../models';
import {Op} from 'sequelize';

async function manufacturerHandler(req, res) {
  const {id} = req.query;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: '유효하지 않은 제조사 ID입니다.'
    });
  }

  const manufacturerId = parseInt(id);

  try {
    const manufacturer = await Company.findByPk(manufacturerId);

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: '제조사를 찾을 수 없습니다.'
      });
    }

    // HTTP 메서드에 따라 다른 처리
    switch (req.method) {
      case 'GET':
        return getManufacturer(manufacturer, res);
      case 'PUT':
        return updateManufacturer(manufacturer, req, res);
      case 'DELETE':
        return deleteManufacturer(manufacturer, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('제조사 처리 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

// 특정 제조사 정보 조회
async function getManufacturer(manufacturer, res) {
  return res.status(200).json({
    success: true,
    data: manufacturer
  });
}

// 제조사 정보 수정
async function updateManufacturer(manufacturer, req, res) {
  try {
    const {name} = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '회사명은 필수 입력값입니다.'
      });
    }

    // 수정하려는 이름이 다른 제조사와 중복되는지 확인
    const existingCompany = await Company.findOne({
      where: {
        name,
        id: {[Op.ne]: manufacturer.id} // 자기 자신 제외
      }
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 회사명입니다.'
      });
    }

    await manufacturer.update({name});
    return res.status(200).json({
      success: true,
      message: '제조사 정보가 성공적으로 수정되었습니다.',
      data: manufacturer
    });
  } catch (error) {
    console.error('제조사 수정 실패:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

// 제조사 삭제
async function deleteManufacturer(manufacturer, res) {
  try {
    await manufacturer.destroy();
    return res.status(200).json({
      success: true,
      message: '제조사가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('제조사 삭제 실패:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(manufacturerHandler);
