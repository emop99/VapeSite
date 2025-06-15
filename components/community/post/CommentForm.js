import Link from 'next/link';
import ImageUploader from './ImageUploader';

export default function CommentForm({
                                      user,
                                      postId,
                                      replyToId,
                                      replyToUser,
                                      setReplyToId,
                                      setReplyToUser,
                                      handleCommentSubmit,
                                      commentText,
                                      setCommentText,
                                      commentImage,
                                      setCommentImage,
                                      submitting,
                                      uploading,
                                      setUploading
                                    }) {
  return (
    <div className="p-6 bg-goblin-light/5 border-t border-gray-100 rounded-b-lg">
      {user ? (
        <form id="comment-form" onSubmit={handleCommentSubmit} className="animate-fadeIn">
          <div className="mb-3 flex justify-between items-center">
            <div className="flex items-center">
              {/* 사용자 아바타 */}
              <div className="w-8 h-8 rounded-full bg-goblin-light/30 flex items-center justify-center text-goblin-dark mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <span className="font-medium text-goblin-dark">{user.name}</span>
                {replyToId ? (
                  <span className="text-sm text-gray-600"> <span className="text-accent font-medium">@{replyToUser}</span>님에게 답글 작성 중</span>
                ) : (
                  <span className="text-sm text-gray-600"> 님, 의견을 남겨보세요</span>
                )}
              </div>
            </div>
            {replyToId && (
              <button
                type="button"
                onClick={() => {
                  setReplyToId(null);
                  setReplyToUser(null);
                }}
                className="text-gray-500 hover:text-red-500 text-xs font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors flex items-center"
                aria-label="답글 취소"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
                답글 취소
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="relative">
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                rows="3"
                placeholder="댓글을 작성해주세요..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submitting}
                aria-label="댓글 내용"
              ></textarea>
            </div>

            {/* 이미지 업로드 및 미리보기 */}
            <div className="flex flex-wrap items-center gap-3">
              <ImageUploader
                commentImage={commentImage}
                setCommentImage={setCommentImage}
                uploading={uploading}
                setUploading={setUploading}
                submitting={submitting}
              />

              {/* 제출 버튼 */}
              <button
                type="submit"
                className="ml-auto bg-primary hover:bg-goblin-dark text-white font-medium py-2 px-5 rounded-full transition-all duration-200 disabled:opacity-50 flex items-center shadow-sm hover:shadow-md"
                disabled={submitting || uploading}
                aria-label="댓글 등록"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    작성 중
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    등록하기
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <p className="text-gray-600 mb-3">댓글을 작성하려면 로그인이 필요합니다.</p>
          <Link
            href={`/auth/signin?callbackUrl=/community/post/${postId}`}
            className="inline-flex items-center bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            로그인하기
          </Link>
        </div>
      )}
    </div>
  );
}