import Link from 'next/link';
import Image from "next/image";
import {normalizeImageUrl} from '../utils/helper';

// 제품 카드 컴포넌트
export default function ProductCard({product}) {

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

          {product.price && (
            <p className="text-lg font-bold text-primary">{product.price.toLocaleString()}원</p>
          )}

          {product.PriceComparisons && product.PriceComparisons.length > 0 && (
            <p className="text-sm text-red-600 font-semibold">
              최저가: {product.PriceComparisons[0].price.toLocaleString()}원
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}