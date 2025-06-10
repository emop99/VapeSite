import {getServerSession} from 'next-auth/next';
import User from '../../../models/User';
import WishList from '../../../models/WishList';

// 특정 찜 항목 삭제 API
export default async function handler(req, res) {
  // DELETE 메서드만 허용
  if (req.method !== 'DELETE') {
    return res.status(405).json({message: '허용되지 않는 요청 메서드입니다.'});
  }

  return await handleDeleteRequest(req, res);
}

// DELETE 요청 처리 (찜 항목 삭제)
async function handleDeleteRequest(req, res) {
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

    const productId = req.query.id;

    // 찜 항목이 존재하는지 확인
    const wishItem = await WishList.findOne({
      where: {userId: user.id, productId}
    });

    if (!wishItem) {
      return res.status(404).json({message: '찜 목록에 해당 상품이 없습니다.', isWished: false});
    }

    // 찜 항목 삭제
    await wishItem.destroy();

    return res.status(200).json({
      message: '상품이 찜 목록에서 삭제되었습니다.',
      isWished: false
    });
  } catch (error) {
    console.error('찜 삭제 오류:', error);
    return res.status(500).json({message: '찜 삭제 중 오류가 발생했습니다.'});
  }
}
