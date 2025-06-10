import {getServerSession} from 'next-auth/next';
import User from '../../../models/User';
import Product from '../../../models/Product';
import WishList from '../../../models/WishList';
import Company from '../../../models/Company';
import PriceComparisons from '../../../models/PriceComparisons';
import SellerSite from '../../../models/SellerSite';

// 찜목록 API 라우터
export default async function handler(req, res) {
  // 메서드에 따라 다른 처리
  if (req.method === 'GET') {
    return await handleGetRequest(req, res);
  } else if (req.method === 'POST') {
    return await handlePostRequest(req, res);
  } else if (req.method === 'PATCH') {
    return await handlePatchRequest(req, res);
  } else {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }
}

// GET 요청 처리 (찜 목록 조회)
async function handleGetRequest(req, res) {
  try {
    // 서버 사이드에서 세션 확인 (로그인 확인)
    const session = await getServerSession(req, res);

    if (!session || !session.user) {
      return res.status(401).json({message: '로그인이 필요합니다.'});
    }

    // 사용자 정보 가져오기
    const user = await User.findOne({where: {email: session.user.email}});

    if (!user) {
      return res.status(404).json({message: '사용자 정보를 찾을 수 없습니다.'});
    }

    // 찜 목록 조회 - 가격 비교 및 판매처 정보도 포함
    const wishList = await WishList.findAll({
      where: {userId: user.id},
      include: [
        {
          model: Product,
          include: [
            {model: Company},
            {
              model: PriceComparisons,
              separate: true, // 별도의 쿼리로 가져오기
              order: [['price', 'ASC']], // 가격 오름차순 정렬 (최저가 순)
              limit: 1, // 최저가 1개만 가져오기
              include: [
                {model: SellerSite}
              ]
            }
          ]
        }
      ]
    });

    return res.status(200).json(wishList);
  } catch (error) {
    console.error('찜 목록 조회 오류:', error);
    return res.status(500).json({message: '찜 목록을 가져오는 중 오류가 발생했습니다.'});
  }
}

// POST 요청 처리 (찜하기)
async function handlePostRequest(req, res) {
  try {
    // 서버 사이드에서 세션 확인 (로그인 확인)
    const session = await getServerSession(req, res);

    if (!session || !session.user) {
      return res.status(401).json({message: '찜하기 기능을 사용하려면 로그인이 필요합니다.'});
    }

    const {productId} = req.body;

    // 필수 입력값 검증
    if (!productId) {
      return res.status(400).json({message: '상품 ID가 필요합니다.'});
    }

    // 사용자 정보 가져오기
    const user = await User.findOne({where: {email: session.user.email}});

    if (!user) {
      return res.status(404).json({message: '사용자 정보를 찾을 수 없습니다.'});
    }

    // 상품 존재 여부 확인
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({message: '존재하지 않는 상품입니다.'});
    }

    // 이미 찜한 상품인지 확인
    const existingWish = await WishList.findOne({
      where: {userId: user.id, productId}
    });

    if (existingWish) {
      return res.status(409).json({message: '이미 찜한 상품입니다.', isWished: true});
    }

    // 찜하기 등록
    const wish = await WishList.create({
      userId: user.id,
      productId
    });

    return res.status(201).json({
      message: '상품을 찜 목록에 추가했습니다.',
      isWished: true,
      wishId: wish.id
    });

  } catch (error) {
    console.error('찜하기 오류:', error);
    return res.status(500).json({message: '찜하기 처리 중 오류가 발생했습니다.'});
  }
}

// PATCH 요청 처리 (찜 상태 확인)
async function handlePatchRequest(req, res) {
  try {
    // 서버 사이드에서 세션 확인 (로그인 확인)
    const session = await getServerSession(req, res);

    if (!session || !session.user) {
      return res.status(200).json({isWished: false});
    }

    const {productId} = req.body;

    // 필수 입력값 검증
    if (!productId) {
      return res.status(400).json({message: '상품 ID가 필요합니다.'});
    }

    // 사용자 정보 가져오기
    const user = await User.findOne({where: {email: session.user.email}});

    if (!user) {
      return res.status(404).json({message: '사용자 정보를 찾을 수 없습니다.'});
    }

    // 찜 상태 확인
    const wishItem = await WishList.findOne({
      where: {userId: user.id, productId}
    });

    return res.status(200).json({isWished: !!wishItem});

  } catch (error) {
    console.error('찜 상태 확인 오류:', error);
    return res.status(500).json({message: '찜 상태 확인 중 오류가 발생했습니다.'});
  }
}
