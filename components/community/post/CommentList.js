import CommentItem from './CommentItem';

export default function CommentList({
                                      comments,
                                      user,
                                      handleReplyClick,
                                      handleToggleLike,
                                      handleDeleteComment,
                                      likingCommentIds,
                                      formatDate,
                                      buildCommentTree
                                    }) {
  const commentTree = buildCommentTree(comments);

  return (
    <div className="divide-y divide-gray-100">
      {comments.length > 0 ? (
        <div>
          {commentTree.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              handleReplyClick={handleReplyClick}
              handleToggleLike={handleToggleLike}
              handleDeleteComment={handleDeleteComment}
              likingCommentIds={likingCommentIds}
              formatDate={formatDate}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center animate-fadeIn">
          <div className="bg-goblin-light/10 rounded-xl p-6 max-w-md mx-auto shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-goblin-light mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <h3 className="text-lg font-medium text-goblin-dark mb-2">첫 번째 댓글을 남겨보세요!</h3>
            <p className="text-gray-600 mb-4">
              이 게시글에 대한 의견이나 질문을 공유해보세요.
            </p>
            {user ? (
              <button
                onClick={() => {
                  const commentForm = document.getElementById('comment-form');
                  if (commentForm) {
                    commentForm.scrollIntoView({behavior: 'smooth'});
                    const textarea = commentForm.querySelector('textarea');
                    if (textarea) textarea.focus();
                  }
                }}
                className="bg-primary hover:bg-goblin-dark text-white font-medium py-2 px-5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                댓글 작성하기
              </button>
            ) : (
              <p className="text-accent font-medium">
                댓글을 작성하려면 로그인이 필요합니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}