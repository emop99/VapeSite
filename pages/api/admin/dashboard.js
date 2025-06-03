import {withAdminAuth} from '../../../utils/adminAuth';
import User from '../../../models/User';
import Product from '../../../models/Product';
import Company from '../../../models/Company';

async function dashboardHandler(req, res) {
  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '허용되지 않는 메소드입니다.' });
  }

  try {
    // 대시보드 데이터 수집
    const dashboardData = {};

    // 최근 등록된 사용자 조회 (최근 5명)
    const recentUsers = await User.findAll({
      where: {
        deletedAt: null, // 탈퇴하지 않은 사용자만
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'nickName', 'email', 'createdAt'], // 필요한 필드만 선택
    });

    // 최근 등록된 제품 조회 (최근 5개)
    const recentProducts = await Product.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'visibleName', 'createdAt'], // 필요한 필드만 선택
    });

    // 전체 통계 (사용자 수, 제품 수, 제조사 수)
    const totalUserCount = await User.count({
      where: {
        deletedAt: null,
      },
    });

    const totalProductCount = await Product.count();

    const totalCompanyCount = await Company.count();

    // 응답 데이터 구성
    dashboardData.recentUsers = recentUsers.map(user => ({
      id: user.id,
      name: user.nickName,
      email: user.email,
      createdAt: user.createdAt,
    }));

    dashboardData.recentProducts = recentProducts.map(product => ({
      id: product.id,
      visibleName: product.visibleName,
      createdAt: product.createdAt,
    }));

    dashboardData.stats = {
      totalUsers: totalUserCount,
      totalProducts: totalProductCount,
      totalCompanies: totalCompanyCount,
    };

    // 성공 응답
    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
}

// withAdminAuth 미들웨어를 사용하여 API 핸들러 내보내기
export default withAdminAuth(dashboardHandler);

