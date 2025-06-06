import {useEffect, useState} from 'react';
import Head from 'next/head';
import {FiEdit2, FiPlus, FiTrash2} from 'react-icons/fi';
import AdminPagination from '../../../components/admin/AdminPagination';

export default function SellerSitesManagement() {
  const [sellerSites, setSellerSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' 또는 'edit'
  const [currentSite, setCurrentSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    siteUrl: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const limit = 10; // 페이지당 항목 수

  // 판매 사이트 목록 조회
  const fetchSellerSites = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/admin/seller-sites-manage?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '판매 사이트 조회에 실패했습니다.');
      }

      setSellerSites(result.data.sellerSites);
      setPagination({
        currentPage: result.data.currentPage,
        totalPages: result.data.totalPages,
        totalCount: result.data.totalCount
      });
    } catch (err) {
      setError(err.message);
      console.error('판매 사이트 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드시 판매 사이트 조회
  useEffect(() => {
    fetchSellerSites(pagination.currentPage, searchTerm).then();
  }, [pagination.currentPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    if (page !== pagination.currentPage) {
      setPagination(prev => ({...prev, currentPage: page}));
    }
  };

  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({...prev, currentPage: 1}));
    fetchSellerSites(1, searchTerm).then();
  };

  // 모달 폼 입력 핸들러
  const handleFormChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    // 입력 시 해당 필드의 오류 메시지 삭제
    setFormErrors(prev => ({...prev, [name]: ''}));
  };

  // 모달 열기
  const openModal = (type, site = null) => {
    setModalType(type);
    if (type === 'edit' && site) {
      setCurrentSite(site);
      setFormData({
        name: site.name,
        siteUrl: site.siteUrl
      });
    } else {
      setCurrentSite(null);
      setFormData({
        name: '',
        siteUrl: ''
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = '사이트 이름은 필수 항목입니다.';
    }

    if (!formData.siteUrl.trim()) {
      errors.siteUrl = '사이트 URL은 필수 항목입니다.';
    } else if (!formData.siteUrl.startsWith('http://') && !formData.siteUrl.startsWith('https://')) {
      errors.siteUrl = 'URL은 http:// 또는 https://로 시작해야 합니다.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 판매 사이트 생성
  const createSellerSite = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/admin/seller-sites-manage', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '판매 사이트 생성에 실패했습니다.');
      }

      // 성공 시 모달 닫고 목록 새로고침
      closeModal();
      fetchSellerSites(pagination.currentPage, searchTerm).then();
      alert('판매 사이트가 성공적으로 추가되었습니다.');
    } catch (err) {
      console.error('판매 사이트 생성 오류:', err);
      alert(err.message);
    }
  };

  // 판매 사이트 수정
  const updateSellerSite = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/admin/seller-sites-manage/${currentSite.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '판매 사이트 수정에 실패했습니다.');
      }

      // 성공 시 모달 닫고 목록 새로고침
      closeModal();
      fetchSellerSites(pagination.currentPage, searchTerm).then();
      alert('판매 사이트가 성공적으로 수정되었습니다.');
    } catch (err) {
      console.error('판매 사이트 수정 오류:', err);
      alert(err.message);
    }
  };

  // 판매 사이트 삭제
  const deleteSellerSite = async (id) => {
    if (!window.confirm('정말 이 판매 사이트를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/seller-sites-manage/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '판매 사이트 삭제에 실패했습니다.');
      }

      // 성공 시 목록 새로고침
      fetchSellerSites(pagination.currentPage, searchTerm).then();
      alert('판매 사이트가 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('판매 사이트 삭제 오류:', err);
      alert(err.message);
    }
  };

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();
    modalType === 'create' ? createSellerSite() : updateSellerSite();
  };

  return (
    <>
      <Head>
        <title>판매 사이트 관리 - 쥬스고블린</title>
      </Head>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">판매 사이트 관리</h1>
          <button
            onClick={() => openModal('create')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlus className="mr-1"/> 판매 사이트 추가
          </button>
        </div>

        {/* 검색 폼 */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="사이트 이름 또는 URL 검색..."
              className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md"
            >
              검색
            </button>
          </form>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* 로딩 스피너 */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* 판매 사이트 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사이트 이름</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {sellerSites && sellerSites.length > 0 ? (
                  sellerSites.map((site) => (
                    <tr key={site.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href={site.siteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {site.siteUrl}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(site.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal('edit', site)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FiEdit2 className="inline-block"/> 수정
                        </button>
                        <button
                          onClick={() => deleteSellerSite(site.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="inline-block"/> 삭제
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      등록된 판매 사이트가 없습니다.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <AdminPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'create' ? '판매 사이트 추가' : '판매 사이트 수정'}
                </h3>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      사이트 이름
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className={`appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.name ? 'border-red-500' : ''}`}
                      placeholder="사이트 이름"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      사이트 URL
                    </label>
                    <input
                      type="text"
                      name="siteUrl"
                      value={formData.siteUrl}
                      onChange={handleFormChange}
                      className={`appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.siteUrl ? 'border-red-500' : ''}`}
                      placeholder="https://"
                    />
                    {formErrors.siteUrl && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.siteUrl}</p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 text-right">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md mr-2 hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {modalType === 'create' ? '추가하기' : '수정하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
