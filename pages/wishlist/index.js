import {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {FaHeart, FaTag} from 'react-icons/fa';
import {normalizeImageUrl} from '../../utils/helper';
import toast from 'react-hot-toast'; // 토스트 라이브러리 import

export default function WishList() {
  const {data: session, status} = useSession();
  const router = useRouter();

  const [wishList, setWishList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 사용자 인증 여부 확인 및 찜 목록 가져오기
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin?callbackUrl=/wishlist');
      return;
    }

    // 찜 목록 가져오기
    const fetchWishList = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/wishlist');
        if (!response.ok) {
          throw new Error('찜 목록을 불러오는데 실패했습니다');
        }
        const data = await response.json();
        setWishList(data);
      } catch (err) {
        setError(err.message);
        toast.error('찜 목록을 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchWishList().then();
  }, [session, status, router]);

  // 찜 삭제 핸들러
  const handleRemoveFromWishList = async (productId, productName) => {
    // 확인 메시지 표시
    if (!window.confirm(`"${productName}" 상품을 찜 목록에서 삭제하시겠습니까?`)) {
      return; // 사용자가 취소를 클릭하면 함수 종료
    }

    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 찜 목록에서 해당 상품 제거
        setWishList(wishList.filter(item => item.productId !== productId));
        // 성공 메시지 표시
        toast.success('찜 목록에서 삭제되었습니다');
      } else {
        // 오류 메시지 표시
        toast.error('찜 삭제 중 오류가 발생했습니다');
      }
    } catch (err) {
      console.error('찜 삭제 오류:', err);
      toast.error('찜 삭제 중 오류가 발생했습니다');
    }
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">찜 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8">
          <p className="text-red-500 text-center">{error}</p>
          <Link href="/" className="block text-center mt-4 text-primary">
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>내 찜 목록 | 쥬스고블린 전자담배 액상 최저가 비교</title>
        <meta name="description" content="내가 찜한 전자담배 액상 목록입니다."/>
      </Head>

      <h1 className="text-2xl md:text-3xl font-bold mb-8">나의 찜 목록</h1>

      {wishList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishList.map((item) => (
            <div key={item.productId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  {/* 상품 링크 */}
                  <Link href={`/products/${item.productId}`} className="block">
                    <div className="flex items-center">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden mr-4">
                        {item.Product.imageUrl ? (
                          <Image
                            src={normalizeImageUrl(item.Product.imageUrl)}
                            alt={item.Product.visibleName}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            이미지 없음
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors mb-1">
                          {item.Product.visibleName}
                        </h2>
                        {/* 카테고리 정보 추가 */}
                        {item.Product.ProductCategory && (
                          <div className="flex items-center text-xs text-gray-600 mb-1">
                            <FaTag className="mr-1" size={12}/>
                            <span>{item.Product.ProductCategory.name}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-500">{item.Product.Company.name}</p>
                      </div>
                    </div>
                  </Link>

                  {/* 찜 삭제 버튼 */}
                  <button
                    onClick={() => handleRemoveFromWishList(item.productId, item.Product.visibleName)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="찜 목록에서 삭제"
                  >
                    <FaHeart className="text-xl"/>
                  </button>
                </div>

                {/* 가격 정보 섹션 */}
                <div className="mt-3 mb-3">
                  {item.Product.PriceComparisons && item.Product.PriceComparisons.length > 0 ? (
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-2">최저가:</span>
                        <span className="text-price font-bold text-lg">
                          {item.Product.PriceComparisons[0].price.toLocaleString()}원
                        </span>
                      </div>
                      {item.Product.PriceComparisons[0].SellerSite && (
                        <div className="text-xs text-gray-500 mt-1">
                          판매처: {item.Product.PriceComparisons[0].SellerSite.name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">가격 정보 없음</p>
                  )}
                </div>

                <div className="mt-4">
                  <Link
                    href={`/products/${item.productId}`}
                    className="inline-block w-full text-center py-2 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded transition-colors duration-200"
                  >
                    상세정보 보기
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center">
            <FaHeart className="text-gray-300 text-5xl mb-4"/>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">찜한 상품이 없습니다</h2>
            <p className="text-gray-500 mb-6">마음에 드는 상품을 찜해보세요!</p>
            <Link href="/products" className="btn-primary">
              상품 둘러보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}