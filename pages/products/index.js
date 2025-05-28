import ProductListPage from "../../components/ProductListPage";

// 제품 검색 결과 페이지
export default function ProductsPage({initialProducts, initialPagination, searchTerm}) {
  return (
    <ProductListPage
      category=""
      title="제품 목록"
      emptyMessage="검색된 제품이 없습니다."
    />
  );
}
