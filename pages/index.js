import {useState, useEffect} from 'react';

// 메인 페이지 컴포넌트
export default function Home() {
  // 제품 데이터 상태
  const [products, setProducts] = useState([]);

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState('');

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 검색 제출 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // 검색어를 사용하여 제품 필터링 (이미 filteredProducts에서 처리됨)
    console.log('검색어:', searchTerm);

    // 검색 결과로 스크롤
    const productSection = document.querySelector('#product-section');
    if (productSection) {
      productSection.scrollIntoView({behavior: 'smooth'});
    }
  };

  // 검색어에 따른 필터링된 제품 목록
  const filteredProducts = products.filter(product =>
    searchTerm === '' ||
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.detail_comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 히어로 섹션 - 검색 엔진 스타일 */}
      <section className="flex flex-col items-center justify-center min-h-[50vh] mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-8">
          쥬스고블린
        </h1>

        {/* 메인 검색바 */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="브랜드, 제품명, 맛 등을 검색해보세요"
              className="w-full px-5 py-4 text-lg border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-4 rounded-r-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary whitespace-nowrap"
            >
              검색
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
