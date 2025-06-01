import React from 'react';

/**
 * 페이지네이션 컴포넌트
 * @param {Object} props - 페이지네이션 속성
 * @param {number} props.currentPage - 현재 페이지 번호
 * @param {number} props.totalPages - 전체 페이지 수
 * @param {Function} props.onPageChange - 페이지 변경 핸들러 함수
 * @returns {JSX.Element} 페이지네이션 컴포넌트
 */
const AdminPagination = ({ currentPage, totalPages, onPageChange }) => {
  // 페이지가 한 페이지뿐이라면 페이지네이션 표시 안함
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-6">
      <nav className="flex items-center">
        {/* 처음으로 버튼 */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          처음
        </button>

        {/* 이전 버튼 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          이전
        </button>

        {/* 페이지 번호 버튼들 */}
        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
          const pageNum = currentPage <= 3
            ? idx + 1
            : currentPage >= totalPages - 2
              ? totalPages - 4 + idx
              : currentPage - 2 + idx;

          // 페이지 수를 벗어나면 표시하지 않음
          if (pageNum > totalPages || pageNum < 1) return null;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`mx-1 px-3 py-1 rounded ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* 다음 버튼 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          다음
        </button>

        {/* 마지막으로 버튼 */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          마지막
        </button>
      </nav>
    </div>
  );
};

export default AdminPagination;
