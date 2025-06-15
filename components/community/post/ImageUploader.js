import {toast} from 'react-hot-toast';
import Image from "next/image";

export default function ImageUploader({
                                        commentImage,
                                        setCommentImage,
                                        uploading,
                                        setUploading,
                                        submitting
                                      }) {
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!file.type.includes('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/community/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setCommentImage(result.data.imageUrl);
        toast.success('이미지가 업로드되었습니다.');
      } else {
        toast.error('이미지 업로드 실패: ' + result.message);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setCommentImage('');
  };

  return (
    <>
      {/* 이미지 업로드 버튼 */}
      <label
        className="cursor-pointer bg-white border border-goblin-light/30 rounded-full py-2 px-4 flex items-center hover:bg-goblin-light/10 transition-colors shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-goblin-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span className="text-sm font-medium text-goblin-dark">이미지 추가</span>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading || submitting}
          aria-label="이미지 업로드"
        />
      </label>

      {/* 업로드 중 로딩 표시 */}
      {uploading && (
        <div className="text-primary flex items-center bg-goblin-light/10 px-3 py-2 rounded-full">
          <div className="w-4 h-4 border-t-2 border-primary border-solid rounded-full animate-spin mr-2"></div>
          <span className="text-sm font-medium">업로드 중...</span>
        </div>
      )}

      {/* 이미지 미리보기 */}
      {commentImage && (
        <div className="relative inline-block mt-2 border border-goblin-light/30 rounded-lg p-2 bg-white shadow-sm">
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-sm"
            title="이미지 삭제"
            aria-label="이미지 삭제"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <Image
            src={commentImage}
            alt="댓글 이미지"
            className="h-28 object-contain rounded"
            width={100}
            height={100}
          />
        </div>
      )}
    </>
  );
}