import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// 폐호흡 상품 페이지
export default function LungInhalationProducts() {
  const router = useRouter();

  // 상태 관리
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 무한 스크롤을 위한 observer 참조
  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProducts();
      }
    }, { threshold: 0.5 });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // 제품 데이터 가져오기
  const fetchProducts = useCallback(async (pageNum = 1, replace = true) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // API 호출 (폐호흡 카테고리로 필터링)
      const response = await fetch(`/api/products?page=${pageNum}&limit=12&category=폐호흡`);

      if (!response.ok) {
        throw new Error('제품을 불러오는데 문제가 발생했습니다.');
      }

      const data = await response.json();

      // API 응답 구조 확인
      const productList = data.products || data;

      // 제품 목록 업데이트 (첫 페이지면 교체, 아니면 추가)
      setProducts(prevProducts => {
        if (replace) {
          return productList;
        } else {
          return [...prevProducts, ...productList];
        }
      });

      // 더 불러올 제품이 있는지 확인
      if (data.pagination) {
        setHasMore(data.pagination.page < data.pagination.totalPages);
        setPage(data.pagination.page);
      } else {
        // 페이지네이션 정보가 없으면 더 이상 불러올 제품이 없다고 가정
        setHasMore(false);
      }

      setError(null);
    } catch (err) {
      console.error('제품 로딩 오류:', err);
      setError('제품을 불러오는데 문제가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // 추가 제품 로드 함수
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1, false);
    }
  }, [fetchProducts, page, loadingMore, hasMore]);

  // 초기 데이터 로드
  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse text-primary text-lg">제품 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <Link href="/" className="text-primary mt-4 inline-block">
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">폐호흡 제품 목록</h1>
      </div>

      {/* 제품 목록 */}
      {products.length > 0 ? (
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                ref={index === products.length - 1 ? lastProductElementRef : null}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="p-4">
                    <div className="h-48 bg-gray-100 flex items-center justify-center mb-4">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400">이미지 없음</div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>

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
            ))}
          </div>

          {/* 추가 로딩 인디케이터 */}
          {loadingMore && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-pulse text-primary">더 많은 제품을 불러오는 중...</div>
            </div>
          )}

          {/* 더 이상 제품이 없을 때 메시지 */}
          {!hasMore && products.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              모든 제품을 불러왔습니다.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">폐호흡 제품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
