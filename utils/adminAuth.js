import { getToken } from 'next-auth/jwt';

/**
 * 어드민 권한을 체크하는 유틸리티 함수
 * @param {Object} req - Next.js API 요청 객체
 * @returns {Promise<boolean>} 어드민 권한이 있으면 true, 없으면 false
 */
export async function checkAdminPermission(req) {
  try {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET
    });

    // 토큰이 없거나 어드민이 아닌 경우 접근 거부
    if (!token || token.grade !== 'ADMIN') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('권한 확인 중 오류 발생:', error);
    return false;
  }
}

/**
 * 어드민 API를 위한 미들웨어 래퍼 함수
 * @param {Function} handler - API 핸들러 함수
 * @returns {Function} 권한 체크가 포함된 새로운 핸들러 함수
 */
export function withAdminAuth(handler) {
  return async (req, res) => {
    const isAdmin = await checkAdminPermission(req);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: '관리자 권한이 필요합니다.'
      });
    }

    // 권한이 확인되면 원래 핸들러 실행
    return handler(req, res);
  };
}
