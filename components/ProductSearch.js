import {useState} from 'react';
import {FiPlus} from 'react-icons/fi';

export default function ProductSearch({
                                        inputSearchKeyword,
                                        onInputChange,
                                        onSubmit,
                                        orKeywords,
                                        onAddOrKeyword,
                                        onRemoveOrKeyword
                                      }) {
  if (typeof orKeywords === 'string') {
    if (orKeywords.includes(',')) {
      orKeywords = orKeywords.split(',');
    } else {
      orKeywords = [orKeywords];
    }
  }

  // 추가 키워드 입력 상태
  const [showKeywordInput, setShowKeywordInput] = useState(false);
  // 새 키워드 입력값
  const [newKeyword, setNewKeyword] = useState('');

  // 키워드 입력 토글
  const toggleKeywordInput = () => {
    setShowKeywordInput((prev) => !prev);
    setNewKeyword('');
  };

  // 새 키워드 추가 처리
  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      onAddOrKeyword(newKeyword.trim());
      setNewKeyword('');
      setShowKeywordInput(false);
      // 키워드 추가 후 폼 제출 처리는 ProductListPage에서 직접 처리하므로 제거
    }
  };

  return (
    <div className="mb-6 w-full">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row w-full max-w-2xl gap-2">
        <div className="flex w-full">
          <input
            type="text"
            value={inputSearchKeyword}
            onChange={onInputChange}
            placeholder="브랜드, 제품명 등을 검색어로 추가하세요."
            className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary whitespace-nowrap transition-colors duration-200"
          >
            검색
          </button>
        </div>
        <button
          type="button"
          className="flex items-center justify-center gap-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 shadow-sm"
          onClick={toggleKeywordInput}
        >
          <FiPlus className="text-lg"/>
          <span>검색 키워드 추가</span>
        </button>
      </form>

      {/* 키워드 입력 필드 */}
      {showKeywordInput && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="추가할 검색 키워드를 입력하세요"
            className="flex-grow w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
          >
            추가
          </button>
          <button
            type="button"
            onClick={toggleKeywordInput}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
          >
            취소
          </button>
        </div>
      )}

      {/* OR 검색어 리스트 */}
      {orKeywords && orKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {orKeywords.map((kw) => (
            <span key={kw}
                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm flex items-center shadow-sm border border-primary/20 transition-all duration-200 hover:bg-primary/20">
              {kw}
              <button
                type="button"
                className="ml-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-200"
                onClick={() => {
                  onRemoveOrKeyword(kw);
                  // 키워드 제거 후 폼 제출 처리는 ProductListPage에서 직접 처리하므로 제거
                }}
                aria-label={`${kw} 키워드 삭제`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
