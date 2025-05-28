import {useState} from 'react';
import {useRouter} from 'next/router';

// 메인 페이지 컴포넌트
export default function Home() {
  const router = useRouter();

  // 검색어 상태
  const [searchKeyword, setSearchKeyword] = useState('');

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // 검색 제출 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('검색어:', searchKeyword);

    // 검색어가 있으면 products 페이지로 리다이렉트
    if (searchKeyword.trim()) {
      router.push({
        pathname: '/products',
        query: {search: searchKeyword}
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 히어로 섹션 - 검색 엔진 스타일 */}
      <section className="flex flex-col items-center justify-center min-h-[50vh] mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-8 font-poppins">
          JuiceGoblin
        </h1>

        {/* 메인 검색바 */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              value={searchKeyword}
              onChange={handleSearchChange}
              placeholder="브랜드, 제품명 등을 검색해보세요."
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
