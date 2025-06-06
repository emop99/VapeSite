import Link from 'next/link';
import Image from "next/image";
import {normalizeImageUrl} from '../utils/helper';

// 제품 카드 컴포넌트
export default function ProductCard({product}) {
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
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
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