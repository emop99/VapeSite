import Link from 'next/link';
import Image from "next/image";
import {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import {FaHeart, FaRegHeart} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {normalizeImageUrl} from '../utils/helper';

// 제품 카드 컴포넌트
export default function ProductCard({product}) {
  const {data: session} = useSession();
  const router = useRouter();
  const [isWished, setIsWished] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  // 찜 상태 체크
  useEffect(() => {
    if (product && session?.user) {
      checkWishStatus(product.id).then();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, session]);

  // 찜 상태 확인 함수
  const checkWishStatus = async (productId) => {
    if (!session?.user) {
      setIsWished(false);
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({productId}),
      });

      if (response.ok) {
        const data = await response.json();
        setIsWished(data.isWished);
      }
    } catch (error) {
      console.error('찜 상태 확인 오류:', error);
    }
  };

  // 찜하기/취소 토글 함수
  const toggleWish = async (e) => {
    // 이벤트 버블링 방지 (Link 클릭 방지)
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      // 로그인하지 않은 사용자는 로그인 페이지로 이동
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(router.asPath));
      return;
    }

    setWishLoading(true);
    try {
      if (isWished) {
        // 찜 취소
        const response = await fetch(`/api/wishlist/${product.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const data = await response.json();
          setIsWished(data.isWished);
          toast.success('찜 목록에서 삭제되었습니다.');
        }
      } else {
        // 찜하기
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({productId: product.id}),
        });

        if (response.ok) {
          const data = await response.json();
          setIsWished(data.isWished);
          toast.success('찜 목록에 추가되었습니다.');
        }
      }
    } catch (error) {
      console.error('찜하기 오류:', error);
      toast.error('찜하기 처리 중 오류가 발생했습니다.');
    } finally {
      setWishLoading(false);
    }
  };

  // 평균 평점 표시를 위한 별 아이콘 생성 함수
  const renderStars = (rating) => {
    if (!rating) return null;

    // 소수점 한 자리까지 표시
    const roundedRating = Math.round(rating * 10) / 10;

    return (
      <div className="flex items-center">
        <div className="flex text-yellow-400 mr-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-4 h-4 fill-current"
                 xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                fill={star <= roundedRating ? "currentColor" : "none"}
                stroke={star <= roundedRating ? "none" : "currentColor"}
                strokeWidth="1"
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          ))}
        </div>
        <span className="text-xs text-gray-600">
          {roundedRating} ({product.reviewCount || 0})
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* 찜하기 버튼 (상단 우측에 위치) */}
      <button
        onClick={toggleWish}
        disabled={wishLoading}
        className={`absolute top-3 right-3 z-10 p-3 rounded-full border ${
          isWished
            ? 'bg-pink-100 text-pink-500'
            : 'bg-gray-100 text-gray-400 hover:text-gray-600'
        }`}
        aria-label={isWished ? '찜 취소하기' : '찜하기'}
      >
        {isWished ? <FaHeart className="text-lg"/> : <FaRegHeart className="text-lg"/>}
      </button>

      <Link href={`/products/${product.id}`}>
        <div className="p-4">
          <div className="h-48 bg-gray-100 flex items-center justify-center mb-4">
            {product.imageUrl ? (
              <Image
                src={normalizeImageUrl(product.imageUrl)}
                alt={product.visibleName}
                width={300}
                height={300}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-gray-400">이미지 없음</div>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.visibleName}</h3>

          {product.Company && (
            <p className="text-sm text-gray-600 mb-2">{product.Company.name}</p>
          )}

          {product.ProductCategory && (
            <p className="text-xs text-gray-500 mb-2">{product.ProductCategory.name}</p>
          )}

          {/* 리뷰 정보 표시 */}
          {product.averageRating > 0 && (
            <div className="mb-2">
              {renderStars(product.averageRating)}
            </div>
          )}

          {product.price && (
            <p className="text-lg font-bold text-primary">{product.price.toLocaleString()}원</p>
          )}

          {product.PriceComparisons && product.PriceComparisons.length > 0 && (
            <p className="text-sm text-red-600 font-semibold">
              최저가: {product.PriceComparisons[0].price.toLocaleString()}원
            </p>
          )}

          {/* 리뷰 개수 정보 */}
          {product.reviewCount > 0 && (
            <p className="text-xs text-blue-600 mt-2">
              {product.reviewCount}개의 리뷰
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}