import {withAdminAuth} from '../../../../utils/adminAuth';
import {Company} from '../../../../models';
import {Op} from 'sequelize';

async function manufacturersHandler(req, res) {
  // HTTP 메서드에 따라 다른 처리
  switch (req.method) {
    case 'GET':
      return getManufacturers(req, res);
    case 'POST':
      return createManufacturer(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({success: false, message: `Method ${req.method} Not Allowed`});
  }
}

// 제조사 목록 조회
async function getManufacturers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';

    const whereClause = searchTerm
      ? {name: {[Op.like]: `%${searchTerm}%`}}
      : {};

    const {count, rows: manufacturers} = await Company.findAndCountAll({
      where: whereClause,
      order: [['id', 'DESC']],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: {
        manufacturers,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          totalCount: count
        }
      }
    });
  } catch (error) {
    console.error('제조사 목록 조회 실패:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

// 새 제조사 등록
async function createManufacturer(req, res) {
  try {
    const {name} = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '회사명은 필수 입력값입니다.'
      });
    }

    const existingCompany = await Company.findOne({where: {name}});
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 회사명입니다.'
      });
    }

    const newCompany = await Company.create({name});
    return res.status(201).json({
      success: true,
      message: '제조사가 성공적으로 등록되었습니다.',
      data: newCompany
    });
  } catch (error) {
    console.error('제조사 등록 실패:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(manufacturersHandler);
