import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import {toast} from 'react-hot-toast';

export default function PostEditPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isNotice, setIsNotice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [board, setBoard] = useState(null);
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const {boardId, postId} = router.query;
  const isEditMode = !!postId;

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setIsAdmin(userData.user?.role === 'admin');
        } else {
          // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
          router.push('/auth/signin?redirect=' + encodeURIComponent(router.asPath)).then();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('사용자 정보를 불러오는데 실패했습니다.');
      }
    };

    fetchUser().then();
  }, [router]);

  // 게시판 또는 게시글 정보 불러오기
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isEditMode) {
          // 게시글 수정 모드: 게시글 정보 불러오기
          const postResponse = await fetch(`/api/community/posts/${postId}`);
          if (!postResponse.ok) {
            throw new Error('게시글을 불러오는데 실패했습니다.');
          }
          const postData = await postResponse.json();
          setPost(postData.post);
          setTitle(postData.post.title);
          setContent(postData.post.content);
          setIsNotice(postData.post.isNotice);

          // 게시글의 게시판 정보 불러오기
          const boardResponse = await fetch(`/api/community/boards/${postData.post.Board.slug}`);
          if (!boardResponse.ok) {
            throw new Error('게시판 정보를 불러오는데 실패했습니다.');
          }
          const boardData = await boardResponse.json();
          setBoard(boardData.board);

          // 권한 확인: 관리자이거나 작성자만 수정 가능
          if (!isAdmin && postData.post.userId !== user.id) {
            toast.error('게시글을 수정할 권한이 없습니다.');
            router.push(`/community/post/${postId}`);
          }
        } else if (boardId) {
          // 게시글 작성 모드: 게시판 정보 불러오기
          const boardResponse = await fetch(`/api/community/boards?id=${boardId}`);
          if (!boardResponse.ok) {
            throw new Error('게시판 정보를 불러오는데 실패했습니다.');
          }
          const boardData = await boardResponse.json();
          setBoard(boardData.board);
        } else {
          // 게시판 ID가 없는 경우
          throw new Error('게시판 정보가 필요합니다.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.message);
        router.push('/community');
      } finally {
        setLoading(false);
      }
    };

    fetchData().then();
  }, [user, boardId, postId, isEditMode, router, isAdmin]);

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditMode
        ? `/api/community/posts/${postId}`
        : '/api/community/posts';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: isEditMode ? post.boardId : boardId,
          title,
          content,
          isNotice: isAdmin ? isNotice : false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '게시글 저장에 실패했습니다.');
      }

      const result = await response.json();

      toast.success(isEditMode ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.');

      // 게시글 상세 페이지로 이동
      router.push(`/community/post/${isEditMode ? postId : result.post.id}`).then();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            <span className="ml-3 text-gray-600">페이지를 불러오는 중...</span>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-white p-6 rounded-lg shadow-md border-l-4 border-accent">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <h1 className="text-2xl font-bold text-goblin-dark">
                  {isEditMode ? '게시글 수정' : '새 게시글 작성'}
                </h1>
              </div>
              <div className="flex items-center mt-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span>{board?.name || '게시판'}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="p-6">
                {/* 제목 입력 */}
                <div className="mb-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    제목
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    required
                    disabled={submitting}
                  />
                  <p className="mt-1 text-xs text-gray-500">게시글의 내용을 잘 나타내는 제목을 입력해주세요.</p>
                </div>

                {/* 관리자인 경우 공지사항 설정 */}
                {isAdmin && (
                  <div className="mb-6">
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id="isNotice"
                        className="h-5 w-5 text-accent focus:ring-accent border-gray-300 rounded"
                        checked={isNotice}
                        onChange={(e) => setIsNotice(e.target.checked)}
                        disabled={submitting}
                      />
                      <label htmlFor="isNotice" className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                        </svg>
                        공지사항으로 설정
                      </label>
                      <div className="ml-2 text-xs text-gray-500">(관리자 전용)</div>
                    </div>
                  </div>
                )}

                {/* 내용 입력 */}
                <div className="mb-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/>
                    </svg>
                    내용
                  </label>
                  <textarea
                    id="content"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                    rows="15"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용을 입력하세요"
                    required
                    disabled={submitting}
                  ></textarea>
                </div>

                {/* 버튼 */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-100 pt-6">
                  <Link
                    href={isEditMode ? `/community/post/${postId}` : `/community/board/${board?.slug}`}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-200 text-center flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    취소
                  </Link>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                        </svg>
                        {isEditMode ? '수정 완료' : '작성 완료'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <p className="font-medium mb-1">게시글 작성 안내</p>
                <ul className="list-disc list-inside pl-1 space-y-1">
                  <li>타인에게 불쾌감을 주는 내용은 삼가해 주세요.</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
