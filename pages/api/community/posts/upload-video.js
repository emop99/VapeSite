import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import {getServerSession} from 'next-auth/next';

// formidable 옵션으로 파싱을 Promise로 처리하기 위한 함수
const formidablePromise = (req, opts) => {
  return new Promise((resolve, reject) => {
    const form = formidable(opts);
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({fields, files});
    });
  });
};

// API 요청 핸들러
async function uploadVideoHandler(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({success: false, message: '로그인이 필요합니다.'});
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({success: false, message: '허용되지 않는 메소드입니다.'});
  }

  try {
    // 비디오 저장 경로 설정 - '/uploads/videos'로 설정
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');

    // 디렉토리 존재 여부 확인 및 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {recursive: true});
    }

    // formidable 옵션 설정
    const options = {
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB 제한
      filter: (part) => {
        // 모든 비디오 파일 허용 (MIME 타입 체크)
        return part.mimetype?.includes('video/') || false;
      },
      filename: (name, ext, part, form) => {
        // 파일 이름 형식: timestamp-originalfilename.ext
        return `${Date.now()}-${part.originalFilename}`;
      }
    };

    // 파일 업로드 처리
    const {files} = await formidablePromise(req, options);
    const uploadedFile = files.video;

    if (!uploadedFile) {
      return res.status(400).json({success: false, message: '비디오 파일이 없습니다.'});
    }

    // 업로드된 파일 경로 생성
    const relativePath = `/uploads/videos/${path.basename(uploadedFile[0].filepath)}`;

    // 성공 응답 반환
    return res.status(200).json({
      success: true,
      message: '비디오가 성공적으로 업로드되었습니다.',
      data: {videoUrl: relativePath}
    });

  } catch (error) {
    console.error('비디오 업로드 오류:', error);
    return res.status(500).json({success: false, message: '서버 오류가 발생했습니다.'});
  }
}

// next.js의 API config 설정: bodyParser 비활성화 (formidable에서 처리)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default uploadVideoHandler;