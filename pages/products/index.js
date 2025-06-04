import ProductListPage from "../../components/ProductListPage";

// 제품 검색 결과 페이지
export default function ProductsPage({ products, pagination, searchTerm }) {
  return (
    <ProductListPage
      category=""
      title="제품 목록"
      emptyMessage="검색된 제품이 없습니다."
      initialProducts={products}
      initialPagination={pagination}
      initialSearchKeyword={searchTerm}
    />
  );
}

// 서버 사이드에서 데이터 가져오기
export async function getServerSideProps(context) {
  const { page = 1, search = '' } = context.query;

  try {
    // 서버에서 API 직접 호출 (카테고리 없이 검색)
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products?page=${page}&limit=12${search ? `&search=${search}` : ''}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('제품을 불러오는데 문제가 발생했습니다.');
    }

    const data = await response.json();

    return {
      props: {
        products: data.products || [],
        pagination: data.pagination || { page: parseInt(page), totalPages: 1 },
        searchTerm: search
      }
    };
  } catch (error) {
    console.error('제품 검색 로딩 오류:', error);

    // 에러가 발생해도 빈 데이터로 페이지를 렌더링
    return {
      props: {
        products: [],
        pagination: { page: parseInt(page), totalPages: 1 },
        searchTerm: search
      }
    };
  }
}

