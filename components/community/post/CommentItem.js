import Image from "next/image";

export default function CommentItem({
                                      comment,
                                      level = 0,
                                      user,
                                      handleReplyClick,
                                      handleToggleLike,
                                      handleDeleteComment,
                                      likingCommentIds,
                                      formatDate,
                                      renderReplies = true
                                    }) {
  return (
    <div
      key={comment.id}
      id={`comment-${comment.id}`}
      className={`border-b border-gray-200 py-5
        ${level > 0 ? 'ml-4 md:ml-8 pl-4 border-l-2 border-goblin-light/30 px-2 md:px-6' : ''}
        animate-fadeIn hover:bg-goblin-light/5 transition-all duration-300 rounded-lg
        ${comment.isNew ? 'bg-green-50 border-l-4 border-l-accent pl-3 shadow-sm' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          {/* 사용자 아바타 (기본 아이콘) */}
          <div className="w-8 h-8 rounded-full bg-goblin-light/20 flex items-center justify-center text-goblin-dark mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <span className="font-semibold text-goblin-dark">{comment.User?.nickName || '알 수 없음'}</span>
            <span className="text-gray-500 text-xs ml-2">{formatDate(comment.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-gray-700 whitespace-pre-line pl-10">{comment.content}</div>

      {/* 댓글 이미지 표시 */}
      {comment.imageUrl && (
        <div className="mt-3 mb-2 pl-10">
          <Image
            src={comment.imageUrl}
            alt="댓글 이미지"
            className="max-h-60 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            onClick={() => window.open(comment.imageUrl, '_blank')}
            style={{cursor: 'pointer'}}
            width={100}
            height={100}
          />
        </div>
      )}

      <div className="mt-3 pl-10 flex items-center space-x-2">
        {user && (
          <button
            className="text-xs bg-goblin-light/10 text-goblin-dark px-3 py-1.5 rounded-full hover:bg-goblin-light/20 transition-colors flex items-center"
            onClick={() => handleReplyClick(comment.id)}
            aria-label="답글 작성"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            </svg>
            답글
          </button>
        )}

        {/* 좋아요 버튼 */}
        <button
          className={`text-xs px-3 py-1.5 rounded-full flex items-center transition-colors
            ${comment.likedByUser ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            ${likingCommentIds.includes(comment.id) ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          aria-label="좋아요"
          disabled={likingCommentIds.includes(comment.id)}
          onClick={() => handleToggleLike(comment.id, comment.likedByUser)}
        >
          <svg xmlns="http://www.w3.org/2000/svg"
               className={`h-3.5 w-3.5 mr-1 ${comment.likedByUser ? 'fill-accent text-accent' : 'text-gray-400'}`}
               viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
          </svg>
          좋아요
          <span className="ml-1 font-semibold">{comment.likeCount || 0}</span>
        </button>

        {user && user.id === comment.userId && (
          <button
            className="inline-flex items-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors px-3 py-1.5 rounded-full text-sm"
            onClick={() => handleDeleteComment(comment.id)}
            aria-label="게시글 삭제"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            삭제
          </button>
        )}
      </div>

      {renderReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              user={user}
              handleReplyClick={handleReplyClick}
              handleToggleLike={handleToggleLike}
              handleDeleteComment={handleDeleteComment}
              likingCommentIds={likingCommentIds}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
