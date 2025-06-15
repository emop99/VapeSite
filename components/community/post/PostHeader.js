import Link from 'next/link';

export default function PostHeader({post, user, handleDeletePost, formatDate}) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 transition-all duration-300 hover:shadow-lg">
      {/* 게시글 헤더 */}
      <div className="border-b border-gray-200 p-4 md:p-6">
        <div className="flex flex-wrap items-center mb-2">
          {post.isNotice && (
            <span className="bg-accent text-white text-xs font-semibold mr-2 px-3 py-1 rounded-full">
              공지
            </span>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-goblin-dark">{post.title}</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-500 mt-4">
          <div className="flex flex-wrap items-center mb-3 sm:mb-0 gap-y-2">
            <div className="flex items-center mr-4">
              <div className="w-7 h-7 rounded-full bg-goblin-light/20 flex items-center justify-center text-goblin-dark mr-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <span className="font-medium">{post.User?.nickName || '알 수 없음'}</span>
            </div>
            <div className="flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-goblin-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-goblin-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>{post.viewCount}</span>
            </div>
          </div>

          {user && user.id === post.userId && (
            <div className="flex space-x-2">
              <Link
                href={`/community/edit?postId=${post.id}`}
                className="inline-flex items-center bg-goblin-light/10 text-primary hover:bg-goblin-light/20 transition-colors px-3 py-1.5 rounded-full text-sm"
                aria-label="게시글 수정"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                수정
              </Link>
              <button
                className="inline-flex items-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors px-3 py-1.5 rounded-full text-sm"
                onClick={handleDeletePost}
                aria-label="게시글 삭제"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}