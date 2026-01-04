import {useEffect, useState} from 'react';
import Link from 'next/link';
import Image from "next/image";
import {normalizeImageUrl} from '../../utils/helper';

export default function SimilarProductsManager({productId}) {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${productId}/similar`);

        if (!response.ok) {
          throw new Error('유사 상품을 불러오는데 실패했습니다');
        }

        const data = await response.json();

        if (data.success) {
          setSimilarProducts(Object.values(data.products));
        } else {
          throw new Error(data.message || '유사 상품을 불러오는데 실패했습니다');
        }
      } catch (err) {
        console.error('유사 상품 로딩 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts().then();
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">유사 상품 목록</h2>
        <div className="flex justify-center items-center min-h-[100px]">
          <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">유사 상품 목록</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">유사 상품 목록</h2>
      </div>

      {similarProducts.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          유사한 상품이 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 border-b text-left">이미지</th>
              <th className="py-2 px-3 border-b text-left">상품명</th>
              <th className="py-2 px-3 border-b text-left">관리</th>
            </tr>
            </thead>
            <tbody>
            {similarProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 border-b">
                  {product.imageUrl ? (
                    <Image
                      src={normalizeImageUrl(product.imageUrl)}
                      alt={product.visibleName}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                      unoptimized
                      onError={(e) => {
                        e.target.src = `${process.env.NEXT_PUBLIC_SITE_URL}/image/no_search_product.png`;
                      }}
                    />
                  ) : (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SITE_URL}/image/no_search_product.png`}
                      alt={product.visibleName}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                      unoptimized
                    />
                  )}
                </td>
                <td className="py-2 px-3 border-b">{product.visibleName}</td>
                <td className="py-2 px-3 border-b">
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
