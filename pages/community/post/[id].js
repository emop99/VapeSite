import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {toast} from 'react-hot-toast';

// 컴포넌트 임포트
import PostHeader from '../../../components/community/post/PostHeader';
import PostContent from '../../../components/community/post/PostContent';
import CommentSection from '../../../components/community/post/CommentSection';

export default function PostDetailPage({post: initialPost, comments: initialComments}) {
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialComments || []);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const {id} = router.query;

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        setUser(null);
      }
    };

    fetchUser().then();
  }, []);


  // 댓글 작성 핸들러
  const handleCommentSubmit = async (e, commentData = null) => {
    if (e) e.preventDefault();

    if (!user) {
      toast.error('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    // commentData가 있으면 그것을 사용하고, 없으면 기존 상태 사용
    const content = commentData?.content;
    const imageUrl = commentData?.imageUrl;
    const parentId = commentData?.parentId;

    if (!content.trim()) {
      toast.error('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: id,
          content: content,
          imageUrl: imageUrl,
          parentId: parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '댓글 작성에 실패했습니다.');
      }

      // 댓글 작성 성공
      const result = await response.json();

      // 새 댓글에 ID 표시 추가
      const newComment = {
        ...result.comment,
        isNew: true // 새 댓글 표시
      };

      // 댓글 목록 업데이트
      setComments([...comments, newComment]);

      toast.success(parentId ? '답글이 작성되었습니다.' : '댓글이 작성되었습니다.');

      return result; // 결과 반환
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error.message);
      throw error; // 에러 전파
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // 댓글 계층 구조 생성
  const buildCommentTree = (comments) => {
    const commentMap = {};
    const rootComments = [];

    // 댓글 맵 생성
    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: []
      };
    });

    // 댓글 계층 구조 구성
    comments.forEach(comment => {
      if (comment.parentId) {
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        } else {
          rootComments.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  // 댓글 좋아요 토글 핸들러
  const handleToggleLike = async (commentId, liked) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(router.asPath)).then();
      return;
    }

    try {
      const response = await fetch('/api/community/comment-like', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          commentId,
          action: liked ? 'unlike' : 'like'
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '좋아요 처리에 실패했습니다.');
      }
      // 서버에서 최신 좋아요 정보 반환한다고 가정
      const result = await response.json();
      setComments(prevComments =>
        prevComments.map(c =>
          c.id === commentId
            ? {
              ...c,
              likeCount: result.likeCount,
              likedByUser: result.likedByUser
            }
            : c
        )
      );

      return result; // 결과 반환
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error(error.message);
      throw error; // 에러 전파
    }
  };


  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch('/api/community/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '댓글 삭제에 실패했습니다.');
      }

      // 댓글 목록 업데이트 (삭제된 댓글 제거)
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success('댓글이 삭제되었습니다.');

      // 만약 삭제된 댓글이 현재 답글 작성 중인 댓글이라면, 답글 작성 취소
      // if (replyToId === commentId) {
      //   setReplyToId(null);
      //   setReplyToUser(null);
      // }

      return {success: true}; // 성공 결과 반환
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error.message);
      throw error; // 에러 전파
    }
  };

  // 글 삭제 핸들러
  const handleDeletePost = async () => {
    if (!user || user.id !== post.userId) {
      toast.error('게시글을 삭제할 권한이 없습니다.');
      return;
    }

    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/community/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '게시글 삭제에 실패했습니다.');
      }

      toast.success('게시글이 삭제되었습니다.');
      router.push(`/community/board/${post.Board?.slug}`).then();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error.message);
    }
  };

  // 메타 설명 생성 함수
  const generateMetaDescription = (post) => {
    if (!post) return '전자담배 액상 최저가 비교 가격 변동 확인 사이트';

    // HTML 태그 제거
    const contentWithoutTags = post.content.replace(/<[^>]*>/g, '');

    // 160자 이내로 제한하고 말줄임표 추가
    return contentWithoutTags.length > 157
      ? contentWithoutTags.substring(0, 157) + '...'
      : contentWithoutTags;
  };

  const generateMataImageUrl = (post) => {
    // 본문에서 img 태그 추출
    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch && imgMatch[1]) {
      // 이미지 URL이 상대 경로인 경우 절대 경로로 변환
      const imageUrl = imgMatch[1];
      return imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_SITE_URL}${imageUrl}`;
    }

    // 이미지가 없으면 기본 이미지 URL 반환
    return `${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`;
  }

  return (
    <>
      {post && (
        <Head>
          <title>{post.title ? `${post.title} | 주스고블린 커뮤니티` : '주스고블린 커뮤니티'}</title>
          <meta name="description" content={generateMetaDescription(post)}/>

          {/* Open Graph 태그 */}
          <meta property="og:title" content={post.title || '주스고블린 커뮤니티'}/>
          <meta property="og:description" content={generateMetaDescription(post)}/>
          <meta property="og:type" content="article"/>
          <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/community/post/${id}`}/>
          <meta property="og:image" content={generateMataImageUrl(post)}/>

          {/* Twitter 카드 */}
          <meta name="twitter:card" content="summary_large_image"/>
          <meta name="twitter:title" content={post.title || '주스고블린 커뮤니티'}/>
          <meta name="twitter:description" content={generateMetaDescription(post)}/>
          <meta name="twitter:image" content={generateMataImageUrl(post)}/>

          {/* 추가 메타 태그 */}
          <meta name="article:published_time" content={post.createdAt}/>
          <meta name="article:modified_time" content={post.updatedAt}/>
          {post.Board?.name && <meta name="article:section" content={post.Board.name}/>}
          <meta name="robots" content="index, follow"/>
          <meta name="language" content="Korean"/>
          <meta name="author" content="쥬스고블린"/>

          {/* 캐노니컬 URL */}
          <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/community/post/${id}`}/>
        </Head>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            <span className="ml-3 text-gray-600">게시글을 불러오는 중...</span>
          </div>
        ) : post ? (
          <>
            <div className="mb-6">
              <Link
                href={`/community/board/${post.Board?.slug}`}
                className="inline-flex items-center text-accent hover:text-accent-dark transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                {post.Board?.name || '게시판으로 돌아가기'}
              </Link>
            </div>

            {/* 게시글 헤더 컴포넌트 */}
            <PostHeader
              post={post}
              user={user}
              handleDeletePost={handleDeletePost}
              formatDate={formatDate}
            />

            {/* 게시글 내용 컴포넌트 */}
            <PostContent post={post}/>

            {/* 댓글 섹션 컴포넌트 */}
            <CommentSection
              comments={comments}
              user={user}
              postId={id}
              handleCommentSubmit={handleCommentSubmit}
              handleToggleLike={handleToggleLike}
              handleDeleteComment={handleDeleteComment}
              buildCommentTree={buildCommentTree}
              formatDate={formatDate}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border-t-4 border-red-500 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-red-500 font-bold text-lg mb-4">게시글을 찾을 수 없습니다.</p>
            <Link href="/community" className="inline-flex items-center bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              커뮤니티 메인으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

// 서버 사이드 렌더링을 위한 데이터 페칭
export async function getServerSideProps(context) {
  const {id} = context.query;

  if (!id) {
    return {
      props: {
        post: null,
        comments: [],
        user: null
      }
    };
  }

  try {
    // API 호출을 위한 요청 옵션 설정
    const requestOptions = {
      headers: {}
    };

    // 로그인 상태인 경우 쿠키 추가
    if (context.req.headers.cookie) {
      requestOptions.headers['Cookie'] = context.req.headers.cookie;
    }

    // 게시글 정보 불러오기
    const postResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/community/posts/${id}`, requestOptions);
    if (!postResponse.ok) {
      return {
        props: {
          post: null,
          comments: [],
        }
      };
    }
    const postData = await postResponse.json();

    // 댓글 목록 불러오기
    const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/community/comments?postId=${id}`, requestOptions);
    if (!commentsResponse.ok) {
      return {
        props: {
          post: postData.post,
          comments: [],
        }
      };
    }
    const commentsData = await commentsResponse.json();

    return {
      props: {
        post: postData.post,
        comments: commentsData.comments || [],
      }
    };
  } catch (error) {
    console.error('Error fetching data for post detail page:', error);
    return {
      props: {
        post: null,
        comments: [],
      }
    };
  }
}
