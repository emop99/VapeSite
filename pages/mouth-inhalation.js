import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';

// 입호흡 상품 페이지
export default function MouthInhalationProducts() {
  const router = useRouter();

  // 상태 관리
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 제품 데이터 가져오기
  const fetchProducts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);

      // API 호출 (입호흡 카테고리로 필터링)
      const response = await fetch(`/api/products?page=${pageNum}&limit=12&category=입호흡`);

      if (!response.ok) {
        throw new Error('제품을 불러오는데 문제가 발생했습니다.');
      }

      const data = await response.json();

      // API 응답 구조 확인
      const productList = data.products || data;

      // 제품 목록 업데이트 (항상 교체)
      setProducts(productList);

      // 페이지네이션 정보 업데이트
      if (data.pagination) {
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } else {
        // 페이지네이션 정보가 없으면 기본값 설정
        setPage(1);
        setTotalPages(1);
      }

      setError(null);
    } catch (err) {
      console.error('제품 로딩 오류:', err);
      setError('제품을 불러오는데 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 페이지 변경 처리 함수
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // URL 업데이트하여 히스토리에 기록
      router.push({
        pathname: router.pathname,
        query: { page: newPage }
      }, undefined, { shallow: true });

      fetchProducts(newPage);
    }
  }, [fetchProducts, totalPages, router]);

  // 초기 데이터 로드 및 URL 파라미터 처리
  useEffect(() => {
    // URL에서 페이지 파라미터 읽기
    const pageParam = router.query.page ? parseInt(router.query.page, 10) : 1;

    // 유효한 페이지 번호인지 확인
    if (pageParam >= 1) {
      fetchProducts(pageParam);
    } else {
      fetchProducts(1);
    }
  }, [fetchProducts, router.query.page]);

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
        <h1 className="text-3xl font-bold mb-6">입호흡 제품 목록</h1>
      </div>

      {/* 제품 목록 */}
      {products.length > 0 ? (
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 페이지네이션 UI */}
          <Pagination 
            page={page} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">입호흡 제품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
