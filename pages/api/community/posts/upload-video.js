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
      multiples: true, // 다중 파일 업로드 허용
      filter: (part) => {
        // 모든 비디오 파일 허용 (MIME 타입 체크)
        return part.mimetype?.includes('video/') || false;
      },
      filename: (name, ext, part, form) => {
        // 파일 이름 형식: timestamp-random-originalfilename.ext
        return `${Date.now()}-${Math.random().toString(36).substring(2)}-${part.originalFilename}`;
      }
    };

    // 파일 업로드 처리
    const {files} = await formidablePromise(req, options);

    // 업로드된 파일들 처리 (단일 파일 또는 다중 파일 지원)
    let uploadedFiles = [];

    // files 객체에서 모든 파일 추출
    Object.keys(files).forEach(key => {
      const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]];
      uploadedFiles.push(...fileArray);
    });

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({success: false, message: '비디오 파일이 없습니다.'});
    }

    // 업로드된 파일들의 경로 생성
    const links = uploadedFiles.map(file => {
      return `/uploads/videos/${path.basename(file.filepath)}`;
    });

    // 성공 응답 반환 (Froala 형식에 맞춤)
    // 단일 파일인 경우 기존 형식 유지, 다중 파일인 경우 배열 반환
    if (links.length === 1) {
      return res.status(200).json({
        link: links[0]
      });
    } else {
      return res.status(200).json({
        links: links
      });
    }

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