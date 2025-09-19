import {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/router';
import {toast} from 'react-hot-toast';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Video from '../../../lib/tiptap-extensions/video';

export default function PostEditPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isNotice, setIsNotice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [board, setBoard] = useState(null);
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const router = useRouter();
  const {boardId, postId} = router.query;
  const isEditMode = !!postId;

  // Tiptap 에디터 초기화
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-accent underline hover:text-accent-dark',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Youtube.configure({
        width: '100%',
        height: 'auto',
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'mx-auto my-4 rounded-lg overflow-hidden aspect-video w-full max-w-3xl',
        },
      }),
      Video.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-4',
          controls: true,
          controlsList: 'nodownload',
          preload: 'metadata',
        },
      }),
    ],
    content: content,
    onUpdate: ({editor}) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      handlePaste(view, event, slice) {
        // 이미지 붙여넣기 처리
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                setTimeout(() => handleImageUpload(file), 0);
                event.preventDefault();
                return true;
              }
            }
          }
        }

        const text = event.clipboardData?.getData('text/plain');
        if (text && /^https?:\/\//i.test(text.trim())) {
          const url = text.trim();

          // YouTube URL 확인
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
          if (youtubeRegex.test(url)) {
            // YouTube URL인 경우 YouTube Extension 사용
            editor.commands.setYoutubeVideo({src: url});
            editor.chain().focus().createParagraphNear().run(); // 줄바꿈 추가
            toast.success('YouTube 비디오가 삽입되었습니다.');
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
    },
  });

  // 이미지 업로드 함수
  const handleImageUpload = useCallback(async (file) => {
    if (!editor || !file) return;

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

      const response = await fetch('/api/community/posts/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // 이미지 URL을 에디터에 삽입
        editor.chain().focus().setImage({src: result.data.imageUrl}).run();
        editor.chain().focus().createParagraphNear().run(); // 줄바꿈 추가
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
  }, [editor]);

  // 비디오 업로드 함수
  const handleVideoUpload = useCallback(async (file) => {
    if (!editor || !file) return;

    // 파일 유효성 검사
    if (!file.type.includes('video/')) {
      toast.error('비디오 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 제한 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('파일 크기는 50MB를 초과할 수 없습니다.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/community/posts/upload-video', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // 비디오 URL을 에디터에 삽입
        editor.chain().focus().setVideo({src: result.data.videoUrl}).run();
        toast.success('비디오가 업로드되었습니다.');
      } else {
        toast.error('비디오 업로드 실패: ' + result.message);
      }
    } catch (error) {
      console.error('비디오 업로드 오류:', error);
      toast.error('비디오 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    e.target.value = '';
  }, [handleImageUpload]);

  // 비디오 파일 선택 핸들러
  const handleVideoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    e.target.value = '';
  }, [handleVideoUpload]);

  // YouTube 비디오 추가 함수
  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('YouTube 비디오 URL을 입력하세요:');

    if (!url) return;

    // YouTube URL 검증
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      toast.error('유효한 YouTube URL이 아닙니다.');
      return;
    }

    editor.chain().focus().setYoutubeVideo({src: url}).run();
  }, [editor]);

  // 외부에서 content가 변경될 때 에디터 내용 업데이트
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setIsAdmin(userData.user?.grade === 'ADMIN');
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

  // 링크 모달 열기 함수
  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setInputUrl(previousUrl);
    setLinkModalOpen(true);
  }, [editor]);

  // 링크 추가 함수 수정
  const handleLinkConfirm = useCallback(() => {
    if (!editor) return;

    // URL 유효성 검사
    if (inputUrl && !/^https?:\/\//i.test(inputUrl) && !/^www\./i.test(inputUrl)) {
      toast.error('유효한 URL을 입력해주세요. (예: http:// 또는 https://로 시작하는 URL)');
      return;
    }

    // 링크 제거
    if (inputUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      // 유효한 URL 처리
      let validUrl = inputUrl;
      if (!/^https?:\/\//i.test(inputUrl)) {
        validUrl = 'https://' + inputUrl;
      }

      // 링크 추가
      editor.chain().focus().extendMarkRange('link').setLink({href: validUrl}).run();
    }

    // 모달 닫기 및 상태 초기화
    setLinkModalOpen(false);
    setInputUrl('');
  }, [editor, inputUrl]);

  // 유튜브 모달 열기 함수
  const openYoutubeModal = useCallback(() => {
    if (!editor) return;
    setInputUrl('');
    setYoutubeModalOpen(true);
  }, [editor]);

  // 유튜브 비디오 추가 함수 수정
  const handleYoutubeConfirm = useCallback(() => {
    if (!editor || !inputUrl) return;

    // YouTube URL 검증
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(inputUrl)) {
      toast.error('유효한 YouTube URL이 아닙니다.');
      return;
    }

    editor.chain().focus().setYoutubeVideo({src: inputUrl}).run();
    editor.chain().focus().createParagraphNear().run(); // 줄바꿈 추가
    toast.success('YouTube 비디오가 삽입되었습니다.');

    // 모달 닫기 및 상태 초기화
    setYoutubeModalOpen(false);
    setInputUrl('');
  }, [editor, inputUrl]);

  return (
    <>
      {/* 링크 모달 */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">링크 삽입</h3>
              <div className="mb-4">
                <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  id="url-input"
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">http:// 또는 https://로 시작하는 URL을 입력하세요</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleLinkConfirm}
                  className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 유튜브 모달 */}
      {youtubeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">YouTube 비디오 삽입</h3>
              <div className="mb-4">
                <label htmlFor="youtube-url-input" className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input
                  id="youtube-url-input"
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setYoutubeModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleYoutubeConfirm}
                  className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto sm:px-6 py-6">
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
                  <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">
                    {/* 에디터 툴바 */}
                    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="굵게"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path
                            d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="기울임"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleStrike().run()}
                        className={`p-1 rounded ${editor?.isActive('strike') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="취소선"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path
                            d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846zm-4.078-3H7.629a4.086 4.086 0 0 1-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.03-2.48 0-3.719.782-3.719 2.346 0 .42.218.786.654 1.099.436.313.974.562 1.613.75.62.18 1.297.414 2.03.699z"/>
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({level: 2}).run()}
                        className={`p-1 rounded ${editor?.isActive('heading', {level: 2}) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="제목 2"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({level: 3}).run()}
                        className={`p-1 rounded ${editor?.isActive('heading', {level: 3}) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="제목 3"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path
                            d="M22 8l-.002 2-2.505 2.883c1.59.435 2.757 1.89 2.757 3.617 0 2.071-1.679 3.75-3.75 3.75-1.826 0-3.347-1.305-3.682-3.033l1.964-.382c.156.806.866 1.415 1.718 1.415.966 0 1.75-.784 1.75-1.75s-.784-1.75-1.75-1.75c-.286 0-.556.069-.794.19l-1.307-1.547L19.35 10H15V8h7zM4 4v7h7V4h2v16h-2v-7H4v7H2V4h2z"/>
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="글머리 기호"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path
                            d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={`p-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="번호 매기기"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path
                            d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zm-2 9h3v1H3v-1zm0 4h3v1H3v-1zm0 4h3v1H3v-1zm2-14v3H3V7h2zm0 8v3H3v-3h2zm0-4v3H3v-3h2zm3-8h13v2H8V3zm0 8h13v2H8v-2zm0 8h13v2H8v-2z"/>
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                        className={`p-1 rounded ${editor?.isActive('blockquote') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="인용구"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path
                            d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                        className="p-1 rounded hover:bg-gray-200"
                        title="구분선"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path d="M2 11h2v2H2v-2zm4 0h12v2H6v-2zm14 0h2v2h-2v-2z"/>
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={openLinkModal}
                        className={`p-1 rounded ${editor?.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                        title="링크"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path
                            d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"/>
                        </svg>
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1 rounded hover:bg-gray-200"
                          title="이미지 업로드"
                          disabled={submitting || uploading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                            <path fill="none" d="M0 0h24v24H0z"/>
                            <path
                              d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                          </svg>
                        </button>
                        {uploading && (
                          <div className="absolute -top-1 -right-1 w-3 h-3">
                            <div className="animate-spin w-3 h-3 border-2 border-accent border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={submitting || uploading}
                      />
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="p-1 rounded hover:bg-gray-200"
                          title="비디오 업로드"
                          disabled={submitting || uploading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                            <path fill="none" d="M0 0h24v24H0z"/>
                            <path
                              d="M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 20.007V3.993zM5 5v14h14V5H5zm5.622 3.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"/>
                          </svg>
                        </button>
                        {uploading && (
                          <div className="absolute -top-1 -right-1 w-3 h-3">
                            <div className="animate-spin w-3 h-3 border-2 border-accent border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={videoInputRef}
                        className="hidden"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        disabled={submitting || uploading}
                      />
                      <button
                        type="button"
                        onClick={openYoutubeModal}
                        className="p-1 rounded hover:bg-gray-200"
                        title="YouTube 비디오 삽입"
                        disabled={submitting}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                          <path fill="none" d="M0 0h24v24H0z"/>
                          <path
                            d="M19.606 6.995c-.076-.298-.292-.523-.539-.592C18.63 6.28 16.5 6 12 6s-6.628.28-7.069.403c-.244.068-.46.293-.537.592C4.285 7.419 4 9.196 4 12s.285 4.58.394 5.006c.076.297.292.522.538.59C5.372 17.72 7.5 18 12 18s6.629-.28 7.069-.403c.244-.068.46-.293.537-.592C19.715 16.581 20 14.8 20 12s-.285-4.58-.394-5.005zm1.937-.497C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5v-7l6 3.5-6 3.5z"/>
                        </svg>
                      </button>
                    </div>

                    {/* 에디터 본문 */}
                    <EditorContent
                      editor={editor}
                      className="w-full p-4 flex-grow overflow-y-auto focus:outline-none h-full"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-200 text-center flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    취소
                  </button>
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
