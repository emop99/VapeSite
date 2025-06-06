import {useEffect, useState} from 'react';
import {FaRegStar, FaStar} from 'react-icons/fa';
import {useSession} from 'next-auth/react';

const MAX_PROS_CONS_LENGTH = 500; // 장점, 단점 최대 글자 수 제한
const MAX_TITLE_LENGTH = 100; // 제목 최대 글자 수 제한

const ReviewForm = ({productId, onReviewSubmit, existingReview = null, onCancel = null}) => {
  const {data: session} = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(!!existingReview); // 수정 모드일 때는 폼을 바로 보여줌
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: '',
    pros: '',
    cons: '',
    recommended: true,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const isEditMode = !!existingReview;

  // 글자 수 카운트 상태 추가
  const [charCounts, setCharCounts] = useState({
    title: 0,
    pros: 0,
    cons: 0
  });

  // 별점 선택 관련 상태
  const [hoveredRating, setHoveredRating] = useState(0);

  // 기존 리뷰 데이터로 폼 초기화
  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating || 0,
        title: existingReview.title || '',
        content: existingReview.content || '',
        pros: existingReview.pros || '',
        cons: existingReview.cons || '',
        recommended: existingReview.recommended !== undefined ? existingReview.recommended : true,
      });

      setCharCounts({
        title: (existingReview.title || '').length,
        pros: (existingReview.pros || '').length,
        cons: (existingReview.cons || '').length
      });
    }
  }, [existingReview]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const {name, value, type, checked} = e.target;

    // 제목의 경우 최대 글자 수 제한
    if (name === 'title' && value.length > MAX_TITLE_LENGTH) {
      return;
    }

    // 장점, 단점의 경우 최대 글자 수 제한
    if ((name === 'pros' || name === 'cons') && value.length > MAX_PROS_CONS_LENGTH) {
      return;
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // 제목, 장점, 단점의 글자 수 업데이트
    if (name === 'title' || name === 'pros' || name === 'cons') {
      setCharCounts({
        ...charCounts,
        [name]: value.length
      });
    }
  };

  // 별점 선택 핸들러
  const handleRatingClick = (rating) => {
    setFormData({
      ...formData,
      rating
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 기본 유효성 검사
    if (formData.rating === 0) {
      setFormError('별점을 선택해주세요.');
      return;
    }

    if (!formData.title.trim()) {
      setFormError('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      setFormError('내용을 입력해주세요.');
      return;
    }

    // 잠재적 위험 입력 확인 (스크립트 태그 등)
    const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    if (
      scriptPattern.test(formData.title) ||
      scriptPattern.test(formData.content) ||
      (formData.pros && scriptPattern.test(formData.pros)) ||
      (formData.cons && scriptPattern.test(formData.cons))
    ) {
      setFormError('보안상의 이유로 HTML 태그나 스크립트는 허용되지 않습니다.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      let response;

      if (isEditMode) {
        // 수정 모드
        response = await fetch('/api/products/review', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reviewId: existingReview.id,
            ...formData
          })
        });
      } else {
        // 작성 모드
        response = await fetch('/api/products/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId,
            ...formData
          })
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '리뷰 제출 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      setFormSuccess(isEditMode
        ? '리뷰가 성공적으로 수정되었습니다!'
        : '리뷰가 성공적으로 등록되었습니다!');

      if (!isEditMode) {
        setFormData({
          rating: 0,
          title: '',
          content: '',
          pros: '',
          cons: '',
          recommended: true,
        });
      }

      // 부모 컴포넌트에 리뷰 제출/수정 알림
      if (onReviewSubmit) {
        onReviewSubmit(result.review, isEditMode);
      }

      // 수정 모드에서 취소 버튼을 클릭한 것과 같은 효과
      if (isEditMode && onCancel) {
        setTimeout(() => {
          onCancel();
          setFormSuccess('');
        }, 2000);
        return;
      }

      // 폼 닫기 (작성 모드일 때만)
      if (!isEditMode) {
        setTimeout(() => {
          setShowForm(false);
          setFormSuccess('');
        }, 2000);
      }

    } catch (error) {
      setFormError(error.message || '리뷰를 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    if (isEditMode && onCancel) {
      onCancel();
    } else {
      setShowForm(false);
    }
  };

  // 로그인 상태가 아닌 경우
  if (!session) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
        <p className="text-gray-700 mb-4">리뷰를 작성하려면 로그인이 필요합니다.</p>
        <a
          href={"/auth/signin?callbackUrl=/products/" + productId}
          className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
        >
          로그인하기
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {!isEditMode && <h3 className="text-xl font-bold mb-4">리뷰 작성</h3>}
      {isEditMode && <h3 className="text-xl font-bold mb-4">리뷰 수정</h3>}

      {!showForm && !isEditMode ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors duration-300"
        >
          리뷰 작성하기
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 별점 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">별점</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-2xl mr-1 focus:outline-none"
                >
                  {(hoveredRating || formData.rating) >= star ? (
                    <FaStar className="text-yellow-400"/>
                  ) : (
                    <FaRegStar className="text-yellow-400"/>
                  )}
                </button>
              ))}
              <span className="ml-2 text-gray-600">
                {formData.rating > 0 ? `${formData.rating}/5` : '별점을 선택해주세요'}
              </span>
            </div>
          </div>

          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              maxLength={MAX_TITLE_LENGTH}
              required
            />
            {/* 제목 글자 수 표시 */}
            <div className="text-sm text-gray-500 mt-1">
              {charCounts.title} / {MAX_TITLE_LENGTH}자
            </div>
          </div>

          {/* 내용 입력 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              required
            ></textarea>
          </div>

          {/* 장점 입력 */}
          <div>
            <label htmlFor="pros" className="block text-sm font-medium text-gray-700 mb-1">
              장점 (선택사항)
            </label>
            <textarea
              id="pros"
              name="pros"
              value={formData.pros}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            ></textarea>
            {/* 장점 글자 수 표시 */}
            <div className="text-sm text-gray-500 mt-1">
              {charCounts.pros} / {MAX_PROS_CONS_LENGTH}자
            </div>
          </div>

          {/* 단점 입력 */}
          <div>
            <label htmlFor="cons" className="block text-sm font-medium text-gray-700 mb-1">
              단점 (선택사항)
            </label>
            <textarea
              id="cons"
              name="cons"
              value={formData.cons}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            ></textarea>
            {/* 단점 글자 수 표시 */}
            <div className="text-sm text-gray-500 mt-1">
              {charCounts.cons} / {MAX_PROS_CONS_LENGTH}자
            </div>
          </div>

          {/* 추천 여부 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recommended"
              name="recommended"
              checked={formData.recommended}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="recommended" className="ml-2 block text-sm text-gray-700">
              이 제품을 추천합니다
            </label>
          </div>

          {/* 에러 메시지 */}
          {formError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{formError}</p>
            </div>
          )}

          {/* 성공 메시지 */}
          {formSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-green-700">{formSuccess}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-300"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '처리 중...' : isEditMode ? '리뷰 수정' : '리뷰 등록'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
