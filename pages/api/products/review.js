import {getServerSession} from "next-auth/next";
import Review from '../../../models/Review';
import Product from '../../../models/Product';
import User from '../../../models/User';

// HTML 특수문자를 이스케이프 처리하는 함수
const escapeHTML = (unsafe) => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default async function handler(req, res) {
  // 메서드에 따라 다른 처리
  if (req.method === 'POST') {
    return await handlePostRequest(req, res);
  } else if (req.method === 'PUT') {
    return await handlePutRequest(req, res);
  } else {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }
}

// POST 요청 처리 (리뷰 생성)
async function handlePostRequest(req, res) {
  try {
    // 서버 사이드에서 세션 확인 (로그인 확인)
    const session = await getServerSession(req, res);

    if (!session || !session.user) {
      return res.status(401).json({message: '리뷰를 작성하려면 로그인이 필요합니다.'});
    }

    const {productId, rating, title, content, pros, cons, recommended} = req.body;

    // 필수 입력값 검증
    if (!productId) {
      return res.status(400).json({message: '상품 ID가 필요합니다.'});
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({message: '유효한 별점(1-5)을 입력해주세요.'});
    }

    if (!title) {
      return res.status(400).json({message: '리뷰 제목을 입력해주세요.'});
    }

    if (!content) {
      return res.status(400).json({message: '리뷰 내용을 입력해주세요.'});
    }

    // XSS 공격 방지를 위한 입력값 살균(sanitize)
    const sanitizedTitle = escapeHTML(title.trim());
    const sanitizedContent = escapeHTML(content.trim());
    const sanitizedPros = pros ? escapeHTML(pros.trim()) : null;
    const sanitizedCons = cons ? escapeHTML(cons.trim()) : null;

    // 제품 존재 여부 확인
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({message: '존재하지 않는 제품입니다.'});
    }

    // 사용자 정보 가져오기
    const user = await User.findOne({where: {email: session.user.email}});

    if (!user) {
      return res.status(404).json({message: '사용자 정보를 찾을 수 없습니다.'});
    }

    // 동일 사용자가 이미 해당 제품에 리뷰를 작성했는지 확인
    const existingReview = await Review.findOne({
      where: {
        productId: productId,
        userId: user.id
      }
    });

    if (existingReview) {
      return res.status(400).json({message: '이미 이 제품에 리뷰를 작성하셨습니다.'});
    }

    // 리뷰 생성 (살균된 데이터 사용)
    const review = await Review.create({
      productId,
      userId: user.id,
      rating,
      title: sanitizedTitle,
      content: sanitizedContent,
      pros: sanitizedPros,
      cons: sanitizedCons,
      recommended: recommended !== undefined ? recommended : true,
      helpfulCount: 0,
      userName: escapeHTML(user.nickname || user.name || user.email.split('@')[0])
    });

    // 제품의 평균 평점 업데이트
    await updateProductAverageRating(productId);

    // 생성된 리뷰와 함께 응답
    return res.status(201).json({
      message: '리뷰가 성공적으로 등록되었습니다.',
      review: {
        ...review.get({plain: true}),
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('리뷰 등록 오류:', error);
    return res.status(500).json({message: '리뷰 등록 중 오류가 발생했습니다.'});
  }
}

// PUT 요청 처리 (리뷰 수정)
async function handlePutRequest(req, res) {
  try {
    // 서버 사이드에서 세션 확인 (로그인 확인)
    const session = await getServerSession(req, res);

    if (!session || !session.user) {
      return res.status(401).json({message: '리뷰를 수정하려면 로그인이 필요합니다.'});
    }

    const {reviewId, rating, title, content, pros, cons, recommended} = req.body;

    if (!reviewId) {
      return res.status(400).json({message: '리뷰 ID가 필요합니다.'});
    }

    // 필수 입력값 검증
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({message: '유효한 별점(1-5)을 입력해주세요.'});
    }

    if (!title) {
      return res.status(400).json({message: '리뷰 제목을 입력해주세요.'});
    }

    if (!content) {
      return res.status(400).json({message: '리뷰 내용을 입력해주세요.'});
    }

    // XSS 공격 방지를 위한 입력값 살균(sanitize)
    const sanitizedTitle = escapeHTML(title.trim());
    const sanitizedContent = escapeHTML(content.trim());
    const sanitizedPros = pros ? escapeHTML(pros.trim()) : null;
    const sanitizedCons = cons ? escapeHTML(cons.trim()) : null;

    // 사용자 정보 가져오기
    const user = await User.findOne({where: {email: session.user.email}});

    if (!user) {
      return res.status(404).json({message: '사용자 정보를 찾을 수 없습니다.'});
    }

    // 리뷰 찾기
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({message: '존재하지 않는 리뷰입니다.'});
    }

    // 리뷰 작성자 확인
    if (review.userId !== user.id) {
      return res.status(403).json({message: '자신이 작성한 리뷰만 수정할 수 있습니다.'});
    }

    // 리뷰 수정
    await review.update({
      rating,
      title: sanitizedTitle,
      content: sanitizedContent,
      pros: sanitizedPros ? sanitizedPros : '',
      cons: sanitizedCons ? sanitizedCons : '',
      recommended: recommended !== undefined ? recommended : true,
    });

    // 제품의 평균 평점 업데이트
    await updateProductAverageRating(review.productId);

    // 수정된 리뷰와 함께 응답
    return res.status(200).json({
      message: '리뷰가 성공적으로 수정되었습니다.',
      review: {
        ...review.get({plain: true})
      }
    });

  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    return res.status(500).json({message: '리뷰 수정 중 오류가 발생했습니다.'});
  }
}

// 제품 평균 평점 업데이트 함수
async function updateProductAverageRating(productId) {
  // 모든 리뷰 가져오기
  const allReviews = await Review.findAll({
    where: {productId: productId}
  });

  // 평균 평점 계산
  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / allReviews.length;

  // 제품 업데이트
  const product = await Product.findByPk(productId);
  await product.update({
    averageRating,
    reviewCount: allReviews.length
  });

  return {averageRating, reviewCount: allReviews.length};
}
