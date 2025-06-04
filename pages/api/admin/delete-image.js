import {withAdminAuth} from '../../../utils/adminAuth';
import fs from 'fs';
import path from 'path';

async function deleteImageHandler(req, res) {
  // DELETE 요청만 허용
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: '허용되지 않는 메소드입니다.' });
  }

  try {
    const { imagePath } = req.query;

    if (!imagePath) {
      return res.status(400).json({ success: false, message: '이미지 경로가 필요합니다.' });
    }

    // URL 디코딩 및 경로 처리
    let decodedPath = decodeURIComponent(imagePath);

    // 경로 조작 방지를 위한 기본 검증
    if (decodedPath.includes('..')) {
      return res.status(400).json({ success: false, message: '유효하지 않은 이미지 경로입니다.' });
    }

    // 허용된 도메인 목록 확인
    const allowedDomains = [process.env.NEXT_PUBLIC_SITE_URL, 'localhost']; // 허용된 도메인 목록
    const url = new URL(decodedPath, process.env.NEXT_PUBLIC_SITE_URL); // 기본 도메인으로 URL 생성
    if (!allowedDomains.includes(url.hostname)) {
      return res.status(403).json({success: false, message: '허용되지 않은 도메인입니다.'});
    }

    // 경로에서 프로토콜 제거
    decodedPath = decodedPath.replace(/^[a-zA-Z]+:\/\//, '').replace(/^[^/]+/, '');

    // /uploads/ 폴더 내 파일만 삭제 가능하도록 제한
    if (!decodedPath.startsWith('/uploads/')) {
      return res.status(403).json({ success: false, message: '허용되지 않은 디렉토리입니다.' });
    }

    // 파일 경로 생성
    const filePath = path.join(process.cwd(), 'public', decodedPath);

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: '파일을 찾을 수 없습니다.' });
    }

    // 파일 삭제
    fs.unlinkSync(filePath);

    // 성공 응답 반환
    return res.status(200).json({
      success: true,
      message: '이미지가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
}

export default withAdminAuth(deleteImageHandler);
