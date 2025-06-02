import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Pagination from './Pagination';
import ProductCard from './ProductCard';

// 제품 목록 페이지 컴포넌트
export default function ProductListPage({ 
  category, 
  title, 
  emptyMessage,
  initialProducts = [],
  initialPagination = { page: 1, totalPages: 1 },
  initialSearchKeyword = ''
}) {
  const router = useRouter();

  // 상태 관리
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(!initialProducts.length);
  const [error, setError] = useState(null);

  // 검색어 상태
  const [inputSearchKeyword, setInputSearchKeyword] = useState(initialSearchKeyword);
  const [searchKeyword, setSearchKeyword] = useState(initialSearchKeyword);

  // 페이지네이션 상태
  const [page, setPage] = useState(initialPagination.page);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setInputSearchKeyword(e.target.value);
  };

  // 제품 데이터 가져오기
  const fetchProducts = useCallback(async (pageNum = 1, search = '') => {
    try {
      setLoading(true);

      // API 호출 (카테고리로 필터링, 검색어 포함)
      const response = await fetch(`/api/products?page=${pageNum}&limit=12&category=${category}${search ? `&search=${search}` : ''}`);

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
  }, [category]);

  // 페이지 변경 처리 함수
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // URL 업데이트하여 히스토리에 기록
      router.push({
        pathname: router.pathname,
        query: { page: newPage, ...(searchKeyword ? { search: searchKeyword } : {}) }
      }, undefined, { shallow: true });

      fetchProducts(newPage, searchKeyword);
    }
  }, [fetchProducts, totalPages, router, searchKeyword]);

  // 검색 제출 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('검색어:', inputSearchKeyword);

    // URL 업데이트
    router.push({
      pathname: router.pathname,
      query: { ...(inputSearchKeyword ? { search: inputSearchKeyword } : {}) }
    }, undefined, { shallow: true });

    // 검색어로 제품 가져오기
    fetchProducts(1, inputSearchKeyword);
  };

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
        <h1 className="text-3xl font-bold mb-6">{title}</h1>

        {/* 검색 폼 */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="flex max-w-md">
            <input
              type="text"
              value={inputSearchKeyword}
              onChange={handleSearchChange}
              placeholder="브랜드, 제품명 등을 검색해보세요."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary whitespace-nowrap"
            >
              검색
            </button>
          </form>
        </div>
      </div>

      {/* 제품 목록 */}
      {products.length > 0 ? (
        <div className="mb-12">
          {searchKeyword && (
            <h2 className="text-xl font-medium mb-4">
              &quot;{searchKeyword}&quot; 검색 결과
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* 페이지네이션 UI */}
          <div className="mt-8">
            <Pagination 
              page={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {searchKeyword ? (
            <p className="text-gray-500">&quot;{searchKeyword}&quot;에 대한 검색 결과가 없습니다.</p>
          ) : (
            <p className="text-gray-500">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
