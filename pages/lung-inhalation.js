import ProductListPage from '../components/ProductListPage';

// 폐호흡 상품 페이지
export default function LungInhalationProducts() {
  return (
    <ProductListPage 
      category="폐호흡"
      title="폐호흡 제품 목록"
      emptyMessage="폐호흡 제품이 없습니다."
    />
  );
}
