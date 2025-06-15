import {useState} from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

export default function CommentSection({
                                         comments,
                                         user,
                                         postId,
                                         handleCommentSubmit,
                                         handleToggleLike,
                                         handleDeleteComment,
                                         buildCommentTree,
                                         formatDate
                                       }) {
  // 댓글 관련 상태
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState(null);
  const [replyToUser, setReplyToUser] = useState(null);
  const [likingCommentIds, setLikingCommentIds] = useState([]); // 좋아요 처리 중인 댓글 ID 목록

  // 답글 작성 클릭 핸들러
  const handleReplyClick = (commentId) => {
    // 이미 선택된 댓글이면 취소
    if (replyToId === commentId) {
      setReplyToId(null);
      setReplyToUser(null);
      return;
    }

    // 해당 댓글 찾기
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setReplyToId(commentId);
      setReplyToUser(comment.User?.nickName || '알 수 없음');

      // 댓글 입력창으로 스크롤
      const commentForm = document.getElementById('comment-form');
      if (commentForm) {
        commentForm.scrollIntoView({behavior: 'smooth'});
      }
    }
  };

  // 댓글 제출 핸들러 래퍼
  const handleSubmitWrapper = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await handleCommentSubmit(e, {
        postId,
        content: commentText,
        imageUrl: commentImage,
        parentId: replyToId
      });

      // 성공 시 폼 초기화
      setCommentText('');
      setCommentImage('');
      setReplyToId(null);
      setReplyToUser(null);
    } finally {
      setSubmitting(false);
    }
  };

  // 좋아요 토글 핸들러 래퍼
  const handleToggleLikeWrapper = async (commentId, liked) => {
    if (likingCommentIds.includes(commentId)) return; // 중복 방지

    setLikingCommentIds(prev => [...prev, commentId]);
    try {
      await handleToggleLike(commentId, liked);
    } finally {
      setLikingCommentIds(prev => prev.filter(id => id !== commentId));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6 border-b border-gray-200 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        <h2 className="text-xl font-bold text-goblin-dark">
          댓글 <span className="text-accent">{comments.length}</span>
        </h2>
      </div>

      {/* 댓글 목록 */}
      <CommentList
        comments={comments}
        user={user}
        handleReplyClick={handleReplyClick}
        handleToggleLike={handleToggleLikeWrapper}
        handleDeleteComment={handleDeleteComment}
        likingCommentIds={likingCommentIds}
        formatDate={formatDate}
        buildCommentTree={buildCommentTree}
      />

      {/* 댓글 작성 폼 */}
      <CommentForm
        user={user}
        postId={postId}
        replyToId={replyToId}
        replyToUser={replyToUser}
        setReplyToId={setReplyToId}
        setReplyToUser={setReplyToUser}
        handleCommentSubmit={handleSubmitWrapper}
        commentText={commentText}
        setCommentText={setCommentText}
        commentImage={commentImage}
        setCommentImage={setCommentImage}
        submitting={submitting}
        uploading={uploading}
        setUploading={setUploading}
      />
    </div>
  );
}