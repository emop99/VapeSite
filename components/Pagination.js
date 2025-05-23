import React from 'react';

// 페이지네이션 컴포넌트
export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`px-3 py-1 rounded-l-md border ${
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
          // 현재 페이지 주변 5개 페이지만 표시 (현재 페이지 ± 2)
          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= page - 2 && pageNum <= page + 2)
          ) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 border-t border-b ${
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
            (pageNum === 2 && page > 4) ||
            (pageNum === totalPages - 1 && page < totalPages - 3)
          ) {
            return (
              <span
                key={pageNum}
                className="px-3 py-1 border-t border-b bg-white text-gray-700"
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
          className={`px-3 py-1 rounded-r-md border ${
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