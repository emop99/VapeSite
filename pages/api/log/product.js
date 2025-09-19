import {getServerSession} from 'next-auth/next';
import {PurchaseClickLog, User} from '../../../models';

// 클라이언트 IP 주소 추출 함수
function getClientIP(req) {
  return (
    req.headers['x-real-ip'] ||
    null
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }

  const {productId, sellerId, clickType, priceAtClick} = req.body;

  // 필수 데이터 검증
  if (!productId || !sellerId || !priceAtClick) {
    return res.status(400).json({
      message: '상품 ID, 판매자 ID, 클릭 시점 가격이 필요합니다.'
    });
  }

  // 데이터 타입 검증
  if (typeof productId !== 'number' || typeof sellerId !== 'number' || typeof priceAtClick !== 'number') {
    return res.status(400).json({
      message: '상품 ID, 판매자 ID, 가격은 숫자여야 합니다.'
    });
  }

  // clickType 검증
  const validClickTypes = ['main_button', 'comparison_table'];
  if (clickType && !validClickTypes.includes(clickType)) {
    return res.status(400).json({
      message: '클릭 타입은 main_button 또는 comparison_table이어야 합니다.'
    });
  }

  try {
    // 세션 정보 조회 (로그인 여부 확인)
    const session = await getServerSession(req, res);

    // 클라이언트 IP 주소 추출
    const clientIP = getClientIP(req);

    // 사용자 정보 조회
    let loginUserId = null;
    if (session) {
      const user = await User.findOne({
        where: {email: session.user.email, deletedAt: null}
      });
      loginUserId = user ? user.id : null;
    }

    // 로그 데이터 생성
    const logData = {
      productId,
      sellerId,
      clickType: clickType || 'main_button',
      priceAtClick,
      ip: clientIP,
      userId: loginUserId,
    };

    // 데이터베이스에 로그 저장
    await PurchaseClickLog.create(logData);

    return res.status(204).end();

  } catch (error) {
    console.error('구매 클릭 로그 저장 중 오류 발생:', error);

    // 데이터베이스 관련 오류 처리
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: '입력 데이터가 유효하지 않습니다.',
        details: error.errors.map(err => err.message)
      });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: '존재하지 않는 상품 또는 판매자입니다.'
      });
    }

    return res.status(500).json({
      message: '서버 오류가 발생했습니다.'
    });
  }
}