import React, { useState, useEffect } from 'react';

// 페이지네이션 컴포넌트
export default function Pagination({ page, totalPages, onPageChange }) {
  // 모바일 화면에서는 더 적은 페이지 버튼 표시
  const [visibleRange, setVisibleRange] = useState(2);

  // 클라이언트 사이드에서만 실행되는 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setVisibleRange(window.innerWidth < 640 ? 1 : 2);
    };

    // 초기 설정
    handleResize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex flex-wrap items-center justify-center">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`px-2 sm:px-3 py-1 text-sm sm:text-base rounded-l-md border ${
            page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          이전
        </button>

        {/* 페이지 번호 */}
        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;

          // 모바일에서는 더 적은 페이지 번호 표시
          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= page - visibleRange && pageNum <= page + visibleRange)
          ) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 sm:px-3 py-1 text-sm sm:text-base border-t border-b ${
                  page === pageNum
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          }
          // 생략 부호 표시 (처음과 끝 사이에 생략된 페이지가 있을 때)
          if (
            (pageNum === 2 && page > (visibleRange + 2)) ||
            (pageNum === totalPages - 1 && page < totalPages - (visibleRange + 1))
          ) {
            return (
              <span
                key={pageNum}
                className="px-1 sm:px-3 py-1 text-sm sm:text-base border-t border-b bg-white text-gray-700"
              >
                ...
              </span>
            );
          }
          return null;
        })}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`px-2 sm:px-3 py-1 text-sm sm:text-base rounded-r-md border ${
            page === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          다음
        </button>
      </nav>
    </div>
  );
}
