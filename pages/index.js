import {useState, useEffect} from 'react';
import productData from '../styles/vapemonster_20250514_202727.json';

// 메인 페이지 컴포넌트
export default function Home() {
  // 제품 데이터 상태
  const [products, setProducts] = useState([]);

  // 컴포넌트 마운트 시 제품 데이터 로드
  useEffect(() => {
    // 첫 번째 카테고리의 제품만 가져오기 (예: "입호흡")
    const firstCategory = Object.keys(productData)[0];
    setProducts(productData[firstCategory].slice(0, 12)); // 처음 12개 제품만 표시
  }, []);
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
          베이프 서치
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
              className="bg-primary text-white px-6 py-4 rounded-r-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              검색
            </button>
          </form>
        </div>

        {/* 인기 검색어 */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <span className="text-sm text-gray-500 mr-2">인기 검색어:</span>
          <button onClick={() => setSearchTerm('쥴')} className="text-sm text-primary hover:underline">쥴</button>
          <button onClick={() => setSearchTerm('릴')} className="text-sm text-primary hover:underline">릴</button>
          <button onClick={() => setSearchTerm('망고')} className="text-sm text-primary hover:underline">망고</button>
          <button onClick={() => setSearchTerm('멘솔')} className="text-sm text-primary hover:underline">멘솔</button>
          <button onClick={() => setSearchTerm('바닐라')} className="text-sm text-primary hover:underline">바닐라</button>
        </div>
      </section>

      {/* 제품 리스트 섹션 */}
      <section id="product-section" className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">인기 제품</h2>

        {/* 제품 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 truncate">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">{product.detail_comment}</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">{product.price.toLocaleString()}원</span>
                  <div className="flex space-x-2">
                    <a
                      href={`/products/${product.id || index + 1}`}
                      className="text-sm text-white bg-primary px-3 py-1 rounded-full hover:bg-primary-dark"
                    >
                      상세보기
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
