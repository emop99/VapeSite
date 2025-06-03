import {useRef, useState} from 'react';
import {FiAlertTriangle, FiSave, FiUpload, FiX} from 'react-icons/fi';
import Image from "next/image";
import {normalizeImageUrl} from "../../utils/helper";

/**
 * 상품 폼 컴포넌트
 * @param {object} props - 컴포넌트 프로퍼티
 * @param {object} props.formData - 폼 데이터
 * @param {function} props.setFormData - 폼 데이터 설정 함수
 * @param {array} props.categories - 카테고리 배열
 * @param {array} props.companies - 제조사 배열
 * @param {boolean} props.isSubmitting - 제출 중 상태
 * @param {boolean} props.isAddMode - 추가 모드인지 여부 (추가: true, 수정: false)
 * @param {function} props.onSubmit - 제출 핸들러
 * @param {function} props.onCancel - 취소 핸들러
 */
const ProductForm = ({
  formData,
  setFormData,
  categories,
  companies,
  isSubmitting,
  isAddMode,
  onSubmit,
  onCancel
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.includes('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.data.imageUrl
        }));
      } else {
        alert('이미지 업로드 실패: ' + result.message);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = async () => {
    if (!formData.imageUrl) return;

    // 내부 이미지 업로드 URL인 경우에만 삭제 처리
    if (formData.imageUrl.startsWith('/uploads/product/')) {
      // 사용자에게 삭제 확인
      if (!confirm('이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        return;
      }

      try {
        const encodedPath = encodeURIComponent(formData.imageUrl);
        const response = await fetch(`/api/admin/delete-image?imagePath=${encodedPath}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!result.success) {
          console.error('이미지 삭제 오류:', result.message);
          alert(`이미지 삭제 실패: ${result.message}`);
          return;
        }

        alert('이미지가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('이미지 삭제 오류:', error);
        alert('이미지 삭제 중 오류가 발생했습니다.');
        return;
      }
    } else {
      // 외부 URL인 경우 확인 없이 이미지 URL만 제거
      if (!confirm('이미지 URL을 제거하시겠습니까?')) {
        return;
      }
    }

    // 폼 데이터에서 이미지 URL 제거
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));

    // 파일 선택 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // 필수 입력값 검증
    if (!formData.visibleName || !formData.categoryId) {
      alert('상품명과 카테고리는 필수 입력 항목입니다.');
      return;
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 상품명 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="visibleName"
            value={formData.visibleName}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* 그룹핑 상품명 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            그룹핑 상품명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="productGroupingName"
            value={formData.productGroupingName}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">카테고리 선택</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 제조사 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제조사
          </label>
          <select
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">제조사 선택</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 상품 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상품 이미지
        </label>

        <div className="mt-1 flex items-center">
          {/* 이미지 업로드 버튼 */}
          <label className="cursor-pointer bg-white border border-gray-300 rounded-md py-2 px-3 flex items-center hover:bg-gray-50 transition-colors">
            <FiUpload className="mr-2 text-gray-500" />
            <span className="text-sm text-gray-600">이미지 업로드</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>

          {/* 업로드 중 로딩 표시 */}
          {uploading && (
            <div className="ml-3 text-gray-500 flex items-center">
              <div className="w-4 h-4 border-t-2 border-blue-500 border-solid rounded-full animate-spin mr-2"></div>
              업로드 중...
            </div>
          )}
        </div>

        {/* 이미지 미리보기 */}
        {formData.imageUrl && (
          <div className="mt-2 relative">
            <div className="flex items-start">
              <div className="border border-gray-200 rounded-md p-2 max-w-xs relative">
                {/* 이미지가 내부 업로드인 경우에만 삭제 버튼 표시 */}
                {(formData.imageUrl.startsWith('/uploads/product/')) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="이미지 삭제"
                  >
                    <FiX size={14} />
                  </button>
                )}

                {/* 외부 URL인 경우 URL 제거 버튼 표시 */}
                {(!formData.imageUrl.startsWith('/uploads/product/')) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600 transition-colors"
                    title="이미지 URL 제거"
                  >
                    <FiX size={14} />
                  </button>
                )}

                {/* 이미지 미리보기 */}
                <Image
                  src={normalizeImageUrl(formData.imageUrl)}
                  width={150}
                  height={150}
                  alt="상품 이미지 미리보기"
                  className="h-32 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=이미지+없음";
                  }}
                />
              </div>
            </div>

            {/* 내부 업로드 이미지인 경우에만 삭제 안내 메시지 표시 */}
            {(formData.imageUrl.startsWith('/uploads/product/')) && (
              <div className="mt-2 flex items-center text-amber-600 text-xs">
                <FiAlertTriangle className="mr-1" />
                <span>삭제 버튼을 클릭하면 서버에서 이미지가 완전히 제거됩니다.</span>
              </div>
            )}

            {/* 외부 URL 이미지인 경우 정보 메시지 표시 */}
            {(!formData.imageUrl.startsWith('/uploads/product/')) && (
              <div className="mt-2 flex items-center text-blue-600 text-xs">
                <FiAlertTriangle className="mr-1" />
                <span>외부 이미지 URL입니다. 이미지가 손상되거나 삭제될 경우 표시되지 않을 수 있습니다.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white py-2 px-4 rounded-md mr-3 hover:bg-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-700 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></span>
              {isAddMode ? '등록 중...' : '저장 중...'}
            </>
          ) : (
            <>
              <FiSave className="mr-1"/>
              {isAddMode ? '상품 등록' : '변경사항 저장'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
