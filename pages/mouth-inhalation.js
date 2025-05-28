import ProductListPage from '../components/ProductListPage';

// 입호흡 상품 페이지
export default function MouthInhalationProducts() {
  return (
    <ProductListPage 
      category="입호흡"
      title="입호흡 제품 목록"
      emptyMessage="입호흡 제품이 없습니다."
    />
  );
}
