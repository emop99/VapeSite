import {withAdminAuth} from '../../../../utils/adminAuth';
import Product from '../../../../models/Product';
import ProductCategory from '../../../../models/ProductCategory';
import Company from '../../../../models/Company';

async function productsHandler(req, res) {
  switch (req.method) {
    case 'GET':
      return getProducts(req, res);
    case 'POST':
      return createProduct(req, res);
    default:
      return res.status(405).json({success: false, message: '허용되지 않는 메소드입니다.'});
  }
}

// 상품 목록 조회
async function getProducts(req, res) {
  try {
    const {page = 1, limit = 10, search = '', searchType = 'all', category = '', company = '', hasImage = '', isShow = '', sortField = 'createdAt', sortOrder = 'DESC'} = req.query;
    const offset = (page - 1) * limit;

    // 검색 조건 설정
    const whereClause = {};

    // 조건 처리
    const {Op} = require('sequelize');

    // 검색어가 있는 경우
    if (search) {
      // 검색 타입에 따라 다른 검색 조건 적용
      if (searchType === 'id') {
        // 상품 번호로만 검색
        if (/^\d+$/.test(search)) {
          whereClause.id = parseInt(search);
        } else {
          // 숫자가 아닌 경우 빈 결과 반환을 위한 조건
          whereClause.id = -1; // 존재하지 않는 ID
        }
      } else if (searchType === 'name') {
        // 상품명으로만 검색
        whereClause.visibleName = {
          [Op.like]: `%${search}%`
        };
      } else {
        // 전체 검색 (기본값)
        const isNumeric = /^\d+$/.test(search);
        if (isNumeric) {
          // 상품 번호로 검색하되 상품명도 포함
          whereClause[Op.or] = [
            {id: parseInt(search)},
            {visibleName: {[Op.like]: `%${search}%`}}
          ];
        } else {
          // 상품명으로만 검색
          whereClause.visibleName = {
            [Op.like]: `%${search}%`
          };
        }
      }
    }

    // 카테고리 필터링
    if (category) {
      whereClause.productCategoryId = category;
    }

    // 제조사 필터링
    if (company) {
      whereClause.companyId = company;
    }

    // 이미지 유무 필터링
    if (hasImage === 'yes') {
      whereClause.imageUrl = {
        [Op.not]: null,
        [Op.ne]: ''  // 빈 문자열이 아님
      };
    } else if (hasImage === 'no') {
      whereClause.imageUrl = {
        [Op.or]: [
          { [Op.is]: null },
          { [Op.eq]: '' }  // 빈 문자열인 경우도 포함
        ]
      };
    }

    // 노출 여부 필터링
    if (isShow === 'yes') {
      whereClause.isShow = true;
    } else if (isShow === 'no') {
      whereClause.isShow = false;
    }

    // 정렬 설정 - 허용된 정렬 필드만 사용
    const allowedSortFields = ['id', 'visibleName', 'createdAt'];
    const actualSortField = allowedSortFields.includes(sortField) ? sortField : 'createdAt';
    const actualSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // 상품 목록 조회
    const {count, rows: products} = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[actualSortField, actualSortOrder]],
      include: [
        {model: ProductCategory, attributes: ['id', 'name']},
        {model: Company, attributes: ['id', 'name']}
      ]
    });

    // 모든 카테고리와 제조사 정보 가져오기 (필터용)
    const categories = await ProductCategory.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    const companies = await Company.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    // 응답 데이터
    const data = {
      products,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      },
      filters: {
        categories,
        companies
      },
      sort: {
        field: actualSortField,
        order: actualSortOrder
      }
    };

    return res.status(200).json({success: true, data});

  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    return res.status(500).json({success: false, message: '서버 오류가 발생했습니다.'});
  }
}

// 상품 생성
async function createProduct(req, res) {
  try {
    const productData = req.body;

    // 필수 필드 검증
    if (!productData.visibleName || !productData.categoryId || !productData.productGroupingName) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다. 상품명, 상품그룹명과 카테고리는 필수 항목입니다.'
      });
    }

    // productCategoryId로 변경 (API 요청에서는 categoryId로 받지만 DB 모델에서는 productCategoryId 사용)
    const formattedProductData = {
      ...productData,
      productCategoryId: productData.categoryId,
      isShow: false, // 기본값은 false로 설정
    };

    // categoryId 필드 제거 (중복 방지)
    delete formattedProductData.categoryId;

    // 새 상품 생성
    const newProduct = await Product.create(formattedProductData);

    // 생성된 상품 정보 조회 (관계 정보 포함)
    const product = await Product.findByPk(newProduct.id, {
      include: [
        {model: ProductCategory, attributes: ['id', 'name']},
        {model: Company, attributes: ['id', 'name']}
      ]
    });

    return res.status(201).json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다.',
      data: product
    });

  } catch (error) {
    console.error('상품 생성 오류:', error);

    // 유효성 검사 오류인 경우 구체적인 오류 메시지 반환
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `유효성 검사 오류: ${validationErrors}`
      });
    }

    // 외래키 제약조건 오류 (카테고리나 제조사 ID가 존재하지 않는 경우)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 카테고리 또는 제조사 ID입니다.'
      });
    }

    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(productsHandler);
