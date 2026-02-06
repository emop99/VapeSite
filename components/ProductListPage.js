import {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import Pagination from './Pagination';
import ProductCard from './ProductCard';
import ProductSearch from "./ProductSearch";

// 제품 목록 페이지 컴포넌트
export default function ProductListPage({ 
  category, 
  title, 
  emptyMessage,
  initialProducts = [],
  initialPagination = { page: 1, totalPages: 1 },
                                          initialSearchKeyword = '',
                                          initialOrKeywords = [],
                                          maxPrice
                                        }) {
  const router = useRouter();

  // 상태 관리
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 검색어 상태
  const [inputSearchKeyword, setInputSearchKeyword] = useState(initialSearchKeyword);
  const [searchKeyword, setSearchKeyword] = useState(initialSearchKeyword);
  // OR 검색어 상태
  const [inputSearchOrKeyword, setInputSearchOrKeyword] = useState(initialOrKeywords);
  const [searchOrKeywords, setSearchOrKeywords] = useState(initialOrKeywords);

  // 페이지네이션 상태
  const [page, setPage] = useState(initialPagination.page);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);

  // 모바일 전용 광고 삽입을 위한 상태
  const [isMobile, setIsMobile] = useState(false);
  const [adIndex, setAdIndex] = useState(null);

  // 클라이언트 사이드에서만 화면 크기 체크
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      try {
        // Tailwind sm breakpoint: 640px
        setIsMobile(window.innerWidth < 640);
      } catch (_) {
        // noop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 제품 목록이 바뀌거나 모바일 전환 시 랜덤 광고 위치 선정
  useEffect(() => {
    if (isMobile && products && products.length > 0) {
      const nextIndex = Math.floor(Math.random() * products.length);
      setAdIndex(nextIndex);
    } else {
      setAdIndex(null);
    }
  }, [isMobile, products]);

  // 광고 요소가 DOM에 추가된 뒤 AdSense 렌더 트리거
  useEffect(() => {
    if (!isMobile || adIndex === null) return;
    try {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-undef
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        // 스크립트 비동기 로드 지연 대비 재시도
        setTimeout(() => {
          try {
            // eslint-disable-next-line no-undef
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (_) {
          }
        }, 800);
      }
    } catch (_) {
      // noop
    }
  }, [isMobile, adIndex]);

  // 페이지 뒤로가기/앞으로 가기 시 검색어와 OR 검색어를 유지하기 위해 URL 쿼리 파라미터를 사용
  useEffect(() => {
    const {page, search, orKeywords} = router.query;
    let keywordsArray = [];

    // URL 쿼리 파라미터에서 검색어와 OR 검색어를 가져옴
    if (search) {
      setInputSearchKeyword(search);
      setSearchKeyword(search);
    }
    if (orKeywords) {
      keywordsArray = Array.isArray(orKeywords) ? orKeywords : [orKeywords];
      setInputSearchOrKeyword(keywordsArray);
      setSearchOrKeywords(keywordsArray);
    } else {
      setInputSearchOrKeyword([]);
      setSearchOrKeywords([]);
    }

    // 초기 제품 데이터 가져오기
    fetchProducts(page || 1, search || '', keywordsArray).then();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setInputSearchKeyword(e.target.value);
  };

  // OR 검색어 추가 핸들러
  const handleAddOrKeyword = (keyword) => {
    if (keyword && !inputSearchOrKeyword.includes(keyword)) {
      const arrayInputSearchOrKeyword = typeof inputSearchOrKeyword === 'string' ? [inputSearchOrKeyword] : inputSearchOrKeyword;
      const updatedKeywords = [...arrayInputSearchOrKeyword, keyword];
      setInputSearchOrKeyword(updatedKeywords);
      // 검색에 사용되는 상태도 즉시 업데이트
      setSearchOrKeywords(updatedKeywords);

      // 상태 업데이트 후 URL과 검색 결과도 즉시 업데이트
      setTimeout(() => {
        // URL 업데이트
        router.push({
          pathname: router.pathname,
          query: {
            ...(inputSearchKeyword ? {search: inputSearchKeyword} : {}),
            ...(updatedKeywords.length > 0 ? {orKeywords: updatedKeywords} : {})
          }
        }, undefined, {shallow: true});

        // 검색어로 제품 가져오기
        fetchProducts(1, inputSearchKeyword, updatedKeywords).then();
      }, 0);
    }
  };

  // OR 검색어 제거 핸들러
  const handleRemoveOrKeyword = (keyword) => {
    const updatedKeywords = typeof inputSearchOrKeyword === 'string' ? (keyword === inputSearchOrKeyword ? [] : [inputSearchOrKeyword]) : inputSearchOrKeyword.filter(kw => kw !== keyword);
    setInputSearchOrKeyword(updatedKeywords);
    // 검색에 사용되는 상태도 즉시 업데이트
    setSearchOrKeywords(updatedKeywords);

    // 상태 업데이트 후 URL과 검색 결과도 즉시 업데이트
    setTimeout(() => {
      // URL 업데이트
      router.push({
        pathname: router.pathname,
        query: {
          ...(inputSearchKeyword ? {search: inputSearchKeyword} : {}),
          ...(updatedKeywords.length > 0 ? {orKeywords: updatedKeywords} : {})
        }
      }, undefined, {shallow: true});

      // 검색어로 제품 가져오기
      fetchProducts(1, inputSearchKeyword, updatedKeywords).then();
    }, 0);
  };

  // 제품 데이터 가져오기
  const fetchProducts = useCallback(async (pageNum = 1, search = '', orKeywords = []) => {
    try {
      setLoading(true);

      // OR 검색어 쿼리 파라미터 생성
      const orKeywordsParam = orKeywords.length > 0
        ? orKeywords.map(keyword => `&orKeywords=${keyword}`).join('')
        : '';

      // API 호출 (카테고리로 필터링, 검색어 포함, OR 검색어 포함)
      const response = await fetch(`/api/products?page=${pageNum}&limit=12${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}${orKeywordsParam}${maxPrice ? `&maxPrice=${maxPrice}` : ''}`);

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
        query: {
          page: newPage,
          ...(searchKeyword ? {search: searchKeyword} : {}),
          ...(searchOrKeywords.length > 0 ? {orKeywords: searchOrKeywords} : {})
        }
      }, undefined, { shallow: true });

      fetchProducts(newPage, searchKeyword, searchOrKeywords);
    }
  }, [fetchProducts, totalPages, router, searchKeyword, searchOrKeywords]);

  // 검색 제출 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedKeyword = inputSearchKeyword.trim();

    // 상태 업데이트
    setSearchKeyword(trimmedKeyword);
    setSearchOrKeywords(inputSearchOrKeyword);

    // URL 업데이트
    router.push({
      pathname: router.pathname,
      query: {
        ...(trimmedKeyword ? {search: trimmedKeyword} : {}),
        ...(inputSearchOrKeyword.length > 0 ? {orKeywords: inputSearchOrKeyword} : {})
      }
    }, undefined, { shallow: true });

    // 검색어로 제품 가져오기
    fetchProducts(1, trimmedKeyword, inputSearchOrKeyword).then();
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
        <ProductSearch
          inputSearchKeyword={inputSearchKeyword}
          onInputChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
          orKeywords={searchOrKeywords}
          onAddOrKeyword={handleAddOrKeyword}
          onRemoveOrKeyword={handleRemoveOrKeyword}
        />
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
            {products.map((product, idx) => (
              <div className="contents" key={`wrap-${product.id}`}>
                {/* 제품 카드 */}
                <ProductCard key={`product-${product.id}`} product={product} />

                {/* 모바일 전용 랜덤 광고 카드 (한 개) */}
                {isMobile && adIndex === idx && (
                  <div key={`ad-${page}-${idx}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                    <ins
                      className="adsbygoogle"
                      style={{display: 'block'}}
                      data-ad-client="ca-pub-4259248617155600"
                      data-ad-slot="6131394119"
                      data-ad-format="auto"
                      data-full-width-responsive="true"
                    />
                  </div>
                )}
              </div>
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
