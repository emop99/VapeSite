import {useCallback, useEffect, useRef, useState} from 'react';
import {FiAlertTriangle, FiExternalLink, FiSave, FiUpload, FiX} from 'react-icons/fi';
import Image from "next/image";
import {normalizeImageUrl} from "../../utils/helper";
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Video from '../../lib/tiptap-extensions/video';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import {toast} from 'react-hot-toast';

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
  const [editorUploading, setEditorUploading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [colorPaletteOpen, setColorPaletteOpen] = useState(false);
  const fileInputRef = useRef(null);
  const editorImageInputRef = useRef(null);
  const editorVideoInputRef = useRef(null);

  // Tiptap 에디터 초기화
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      LinkExtension.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-accent underline hover:text-accent-dark',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TiptapImage.configure({
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
    content: formData.description || '<p></p>',
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate: ({editor}) => {
      setFormData(prev => ({ ...prev, description: editor.getHTML() }));
    },
    editorProps: {
      transformPastedHTML(html) {
        return html;
      },
      handlePaste(view, event, slice) {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                setTimeout(() => handleEditorImageUpload(file), 0);
                event.preventDefault();
                return true;
              }
            }
          }
        }

        const text = event.clipboardData?.getData('text/plain');
        if (text && /^https?:\/\//i.test(text.trim())) {
          const url = text.trim();
          const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
          if (youtubeRegex.test(url)) {
            editor.commands.setYoutubeVideo({src: url});
            editor.chain().focus().createParagraphNear().run();
            toast.success('YouTube 비디오가 삽입되었습니다.');
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
    },
  });

  // 에디터 이미지 업로드 함수
  const handleEditorImageUpload = useCallback(async (file) => {
    if (!editor || !file) return;

    if (!file.type.includes('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    try {
      setEditorUploading(true);
      const data = new FormData();
      data.append('image', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        editor.chain().focus().setImage({src: result.data.imageUrl}).run();
        editor.chain().focus().createParagraphNear().run();
        toast.success('이미지가 업로드되었습니다.');
      } else {
        toast.error('이미지 업로드 실패: ' + result.message);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setEditorUploading(false);
    }
  }, [editor]);

  // 에디터 비디오 업로드 함수
  const handleEditorVideoUpload = useCallback(async (file) => {
    if (!editor || !file) return;

    if (!file.type.includes('video/')) {
      toast.error('비디오 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('파일 크기는 50MB를 초과할 수 없습니다.');
      return;
    }

    try {
      setEditorUploading(true);
      const data = new FormData();
      data.append('video', file);

      const response = await fetch('/api/community/posts/upload-video', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        editor.chain().focus().setVideo({src: result.data.videoUrl}).run();
        toast.success('비디오가 업로드되었습니다.');
      } else {
        toast.error('비디오 업로드 실패: ' + result.message);
      }
    } catch (error) {
      console.error('비디오 업로드 오류:', error);
      toast.error('비디오 업로드 중 오류가 발생했습니다.');
    } finally {
      setEditorUploading(false);
    }
  }, [editor]);

  // 외부에서 description이 변경될 때 에디터 내용 업데이트 (초기 로드 시 등)
  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description || '<p></p>');
    }
  }, [formData.description, editor]);

  // 링크 모달 제어
  const openLinkModal = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setInputUrl(previousUrl);
    setLinkModalOpen(true);
  }, [editor]);

  const handleLinkConfirm = useCallback(() => {
    if (!editor) return;
    if (inputUrl && !/^https?:\/\//i.test(inputUrl) && !/^www\./i.test(inputUrl)) {
      toast.error('유효한 URL을 입력해주세요.');
      return;
    }
    if (inputUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let validUrl = inputUrl;
      if (!/^https?:\/\//i.test(inputUrl)) validUrl = 'https://' + inputUrl;
      editor.chain().focus().extendMarkRange('link').setLink({href: validUrl}).run();
    }
    setLinkModalOpen(false);
    setInputUrl('');
  }, [editor, inputUrl]);

  // 유튜브 모달 제어
  const openYoutubeModal = useCallback(() => {
    if (!editor) return;
    setInputUrl('');
    setYoutubeModalOpen(true);
  }, [editor]);

  const handleYoutubeConfirm = useCallback(() => {
    if (!editor || !inputUrl) return;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(inputUrl)) {
      toast.error('유효한 YouTube URL이 아닙니다.');
      return;
    }
    editor.chain().focus().setYoutubeVideo({src: inputUrl}).run();
    editor.chain().focus().createParagraphNear().run();
    setYoutubeModalOpen(false);
    setInputUrl('');
  }, [editor, inputUrl]);

  // HTML 모드 토글
  const toggleHtmlMode = useCallback(() => {
    if (!editor) return;
    if (htmlMode) {
      editor.commands.setContent(htmlContent);
      setFormData(prev => ({ ...prev, description: htmlContent }));
      setHtmlMode(false);
    } else {
      setHtmlContent(editor.getHTML());
      setHtmlMode(true);
    }
  }, [editor, htmlMode, htmlContent, setFormData]);

  // 색상 팔레트 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPaletteOpen && !event.target.closest('.color-palette-container')) {
        setColorPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorPaletteOpen]);

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
    // 내부 이미지 업로드 URL인 경우에만 삭제 처리
    const isInternalImage = () => {
      try {
        // 절대 URL인 경우 (http://, https://)
        if (formData.imageUrl.startsWith('http')) {
          const url = new URL(formData.imageUrl);
          return url.pathname.includes('/uploads/product/');
        }
        // 상대 경로인 경우
        return formData.imageUrl.includes('/uploads/product/');
      } catch (e) {
        return formData.imageUrl.includes('/uploads/product/');
      }
    };

    if (!formData.imageUrl) return;

    // 내부 이미지 업로드 URL인 경우에만 삭제 처리
    if (isInternalImage()) {
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
    <>
      {/* 링크 모달 */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    unoptimized
                    onError={(e) => {
                      e.target.src = `${process.env.NEXT_PUBLIC_SITE_URL}/image/no_search_product.png`;
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

        {/* 상품 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 노출 여부 */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isShow"
                checked={formData.isShow}
                onChange={(e) => setFormData({...formData, isShow: e.target.checked})}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">상품 노출</span>
            </label>
          </div>

          {/* 재전시 여부 */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isRedisplayed"
                checked={formData.isRedisplayed}
                onChange={(e) => setFormData({...formData, isRedisplayed: e.target.checked})}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">재전시</span>
            </label>
          </div>
        </div>

        {/* 재고 수량 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              재고 수량
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 상품 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품 설명
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">
            {/* 에디터 툴바 */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                title="굵게"
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                title="기울임"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M17.154 14c.23.516.346 1.09.346 1.72 0 1.342-.524 2.392-1.571 3.147C14.88 19.622 13.433 20 11.586 20c-1.64 0-3.263-.381-4.87-1.144V16.6c1.52.877 3.075 1.316 4.666 1.316 2.551 0 3.83-.732 3.839-2.197a2.21 2.21 0 0 0-.648-1.603l-.12-.117H3v-2h18v2h-3.846zm-4.078-3H7.629a4.086 4.086 0 0 1-.481-.522C6.716 9.92 6.5 9.246 6.5 8.452c0-1.236.466-2.287 1.397-3.153C8.83 4.433 10.271 4 12.222 4c1.471 0 2.879.328 4.222.984v2.152c-1.2-.687-2.515-1.03-3.946-1.30-2.48 0-3.719.782-3.719 2.346 0 .42.218.786.654 1.099.436.313.974.562 1.613.75.62.18 1.297.414 2.03.699z"/>
                </svg>
              </button>
              <div className="relative color-palette-container">
                <button
                  type="button"
                  onClick={() => setColorPaletteOpen(!colorPaletteOpen)}
                  className="p-1 rounded hover:bg-gray-200 relative"
                  title="텍스트 색상"
                  disabled={isSubmitting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M15.246 14H8.754l-1.6 4H5l6-15h2l6 15h-2.154l-1.6-4zm-.8-2L12 5.885 9.554 12h4.892z"/>
                  </svg>
                  <div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 rounded-full border border-gray-300"
                    style={{backgroundColor: editor?.getAttributes('textStyle').color || '#000000'}}
                  ></div>
                </button>
                {colorPaletteOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-[110]">
                    <div className="grid grid-cols-4 gap-1.5 min-w-[120px]">
                      {[
                        '#000000', '#FF0000', '#00FF00', '#0000FF',
                        '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
                        '#800080', '#FFC0CB', '#A52A2A', '#808080'
                      ].map(color => (
                        <button
                          key={color}
                          type="button"
                          className="w-7 h-7 rounded-full border-2 border-gray-300 hover:border-gray-600 hover:scale-105 transition-all duration-150 shadow-sm"
                          style={{backgroundColor: color}}
                          onClick={() => {
                            editor?.chain().focus().setColor(color).run();
                            setColorPaletteOpen(false);
                          }}
                          title={`색상: ${color}`}
                        />
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => {
                          editor?.chain().focus().unsetColor().run();
                          setColorPaletteOpen(false);
                        }}
                      >
                        색상 제거
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({level: 2}).run()}
                className={`p-1 rounded ${editor?.isActive('heading', {level: 2}) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                title="제목 2"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M22 8l-.002 2-2.505 2.883c1.59.435 2.757 1.89 2.757 3.617 0 2.071-1.679 3.75-3.75 3.75-1.826 0-3.347-1.305-3.682-3.033l1.964-.382c.156.806.866 1.415 1.718 1.415.966 0 1.75-.784 1.75-1.75s-.784-1.75-1.75-1.75c-.286 0-.556.069-.794.19l-1.307-1.547L19.35 10H15V8h7zM4 4v7h7V4h2v16h-2v-7H4v7H2V4h2z"/>
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                title="글머리 기호"
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`p-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                title="번호 매기기"
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zm-2 9h3v1H3v-1zm0 4h3v1H3v-1zm0 4h3v1H3v-1zm2-14v3H3V7h2zm0 8v3H3v-3h2zm0-4v3H3v-3h2zm3-8h13v2H8V3zm0 8h13v2H8v-2zm0 8h13v2H8v-2z"/>
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`p-1 rounded ${editor?.isActive('blockquote') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                title="인용구"
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                className="p-1 rounded hover:bg-gray-200"
                title="구분선"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z"/>
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => editorImageInputRef.current?.click()}
                  className="p-1 rounded hover:bg-gray-200"
                  title="이미지 업로드"
                  disabled={isSubmitting || editorUploading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                  </svg>
                </button>
                {editorUploading && (
                  <div className="absolute -top-1 -right-1 w-3 h-3">
                    <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={editorImageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleEditorImageUpload(file);
                  e.target.value = '';
                }}
                disabled={isSubmitting || editorUploading}
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => editorVideoInputRef.current?.click()}
                  className="p-1 rounded hover:bg-gray-200"
                  title="비디오 업로드"
                  disabled={isSubmitting || editorUploading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 20.007V3.993zM5 5v14h14V5H5zm5.622 3.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"/>
                  </svg>
                </button>
                {editorUploading && (
                  <div className="absolute -top-1 -right-1 w-3 h-3">
                    <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={editorVideoInputRef}
                className="hidden"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleEditorVideoUpload(file);
                  e.target.value = '';
                }}
                disabled={isSubmitting || editorUploading}
              />
              <button
                type="button"
                onClick={openYoutubeModal}
                className="p-1 rounded hover:bg-gray-200"
                title="YouTube 비디오 삽입"
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="none" d="M0 0h24v24H0z"/>
                  <path d="M19.606 6.995c-.076-.298-.292-.523-.539-.592C18.63 6.28 16.5 6 12 6s-6.628.28-7.069.403c-.244.068-.46.293-.537.592C4.285 7.419 4 9.196 4 12s.285 4.58.394 5.006c.076.297.292.522.538.59C5.372 17.72 7.5 18 12 18s6.629-.28 7.069-.403c.244-.068.46-.293.537-.592C19.715 16.581 20 14.8 20 12s-.285-4.58-.394-5.005zm1.937-.497C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5v-7l6 3.5-6 3.5z"/>
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={toggleHtmlMode}
                className={`p-1 rounded ${htmlMode ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'}`}
                title={htmlMode ? 'HTML 모드 (비주얼 모드로 전환)' : 'HTML 모드로 전환'}
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 16 4-4-4-4"/>
                  <path d="m6 8-4 4 4 4"/>
                  <path d="m14.5 4-5 16"/>
                </svg>
              </button>
            </div>

            {/* 에디터 본문 */}
            {htmlMode ? (
              <div className="w-full p-4 flex-grow">
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full h-96 p-3 border-0 focus:outline-none resize-none font-mono text-sm bg-gray-50"
                  placeholder="HTML 코드를 입력하세요..."
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <EditorContent
                editor={editor}
                className="w-full p-4 flex-grow overflow-y-auto focus:outline-none min-h-[300px] tiptap-content"
                disabled={isSubmitting}
              />
            )}
          </div>
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
          {/* 상품 보기 버튼 - 수정 모드일 때만 표시 */}
          {!isAddMode && formData.productId && (
            <a
              href={`/products/${formData.productId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white py-2 px-4 rounded-md mr-3 flex items-center hover:bg-green-700 transition-colors"
            >
              <FiExternalLink className="mr-1"/>
              상품 보기
            </a>
          )}
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
    </>
  );
};

export default ProductForm;
