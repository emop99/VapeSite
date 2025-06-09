import {useCallback, useEffect, useState} from 'react';
import {FiArrowRight, FiEdit, FiExternalLink, FiPlus, FiSave, FiSearch, FiTrash2, FiX} from 'react-icons/fi';

/**
 * 가격 비교 관리 컴포넌트
 * @param {object} props - 컴포넌트 프로퍼티
 * @param {string} props.productId - 상품 ID
 */
const PriceComparisonManager = ({productId}) => {
  const [comparisons, setComparisons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedComparisons, setSelectedComparisons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    id: '',
    sellerSiteId: '',
    price: '',
    sellerUrl: '',
    productId: productId || '',
  });

  // 가격 비교 데이터 로드
  const loadComparisons = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/price-comparisons?productId=${productId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComparisons(data.data);
        } else {
          console.error('가격 비교 데이터 로드 실패:', data.message);
        }
      } else {
        console.error('가격 비교 데이터 로드 실패:', response.statusText);
      }
    } catch (error) {
      console.error('가격 비교 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // 판매자 사이트 목록 로드
  const loadSellerSites = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/seller-sites');

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSites(data.data);
        }
      }
    } catch (error) {
      console.error('판매자 사이트 로드 오류:', error);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    if (productId) {
      loadComparisons().then();
      loadSellerSites().then();
    }
  }, [productId, loadComparisons, loadSellerSites]);

  // 폼 입력 변경 핸들러
  const handleInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 편집 시작 핸들러
  const handleEdit = (comparison) => {
    console.log('편집 시작:', comparison);
    setEditingId(comparison.id);
    setFormData({
      id: comparison.id,
      sellerSiteId: comparison.sellerId,
      price: comparison.price.toString(),
      sellerUrl: comparison.sellerUrl,
      productId: comparison.productId,
    });
  };

  // 가격 비교 수정 핸들러
  const handleUpdateComparison = async () => {
    console.log(formData);
    if (!formData.price) {
      alert('가격은 필수 입력 항목입니다.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/price-comparisons`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      const result = await response.json();

      if (result.success) {
        loadComparisons().then();
        setEditingId(null);
        setFormData({
          id: '',
          sellerSiteId: '',
          price: '',
          sellerUrl: '',
          productId: '',
        });
      } else {
        alert(`가격 비교 수정 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('가격 비교 수정 오류:', error);
      alert('가격 비교 수정 중 오류가 발생했습니다.');
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      id: '',
      sellerSiteId: '',
      price: '',
      sellerUrl: '',
      productId: productId || '',
    });
  };

  // 가격 비교 추가 폼 표시 핸들러
  const handleShowAddForm = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: '',
      sellerSiteId: sites.length > 0 ? sites[0].id.toString() : '',
      price: '',
      sellerUrl: '',
      productId: productId,
    });
  };

  // 가격 비교 추가 핸들러
  const handleAddComparison = async () => {
    if (!formData.sellerSiteId) {
      alert('판매처를 선택해주세요.');
      return;
    }

    if (!formData.price) {
      alert('가격은 필수 입력 항목입니다.');
      return;
    }

    if (!formData.sellerUrl) {
      alert('판매 URL은 필수 입력 항목입니다.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/price-comparisons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          sellerSiteId: formData.sellerSiteId,
          price: parseFloat(formData.price),
          sellerUrl: formData.sellerUrl
        })
      });

      const result = await response.json();

      if (result.success) {
        loadComparisons().then();
        setIsAdding(false);
        setFormData({
          id: '',
          sellerSiteId: '',
          price: '',
          sellerUrl: '',
          productId: productId || '',
        });
        alert('가격 비교가 성공적으로 추가되었습니다.');
      } else {
        alert(`가격 비교 추가 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('가격 비교 추가 오류:', error);
      alert('가격 비교 추가 중 오류가 발생했습니다.');
    }
  };

  // 가격 비교 삭제 핸들러
  const handleDeleteComparison = async (id) => {
    if (!window.confirm('정말로 이 가격 비교 정보를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/price-comparisons`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id})
      });

      const result = await response.json();

      if (result.success) {
        loadComparisons().then();
        alert('가격 비교 정보가 성공적으로 삭제되었습니다.');
      } else {
        alert(`가격 비교 삭제 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('가격 비교 삭제 오류:', error);
      alert('가격 비교 삭제 중 오류가 발생했습니다.');
    }
  };

  // 가격 비교 이관 핸들러
  const handleTransferComparisons = async () => {
    if (!selectedProductId) {
      alert('이관할 상품을 선택해주세요.');
      return;
    }

    if (selectedComparisons.length === 0) {
      alert('이관할 가격 비교를 선택해주세요.');
      return;
    }

    if (!window.confirm('선택한 가격 비교 정보를 정말로 이관하시겠습니까?')) {
      return;
    }

    setTransferLoading(true);

    try {
      const response = await fetch(`/api/admin/price-comparisons/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetProductId: selectedProductId,
          comparisonIds: selectedComparisons,
          sourceProductId: productId,
        })
      });

      const result = await response.json();

      if (result.success) {
        if (result.sourceComparisonCount === 0) {
          alert('선택한 가격 비교 정보가 성공적으로 이관되었으며, 원본 상품이 숨김 상품으로 변경되었습니다.');
        } else {
          alert('가격 비교 정보가 성공적으로 이관되었습니다.');
        }
        setShowTransferModal(false);
        setSelectedComparisons([]);
        loadComparisons().then();
      } else {
        alert(`가격 비교 이관 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('가격 비교 이관 오류:', error);
      alert('가격 비교 이관 중 오류가 발생했습니다.');
    } finally {
      setTransferLoading(false);
    }
  };

  // 검색 핸들러
  const handleSearch = async () => {
    if (!searchQuery) {
      alert('검색어를 입력하세요.');
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(`/api/admin/products?search=${encodeURIComponent(searchQuery)}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSearchResults(result.data.products);
        } else {
          alert(`상품 검색 실패: ${result.message}`);
        }
      } else {
        alert(`상품 검색 실패: ${response.statusText}`);
      }
    } catch (error) {
      console.error('상품 검색 오류:', error);
      alert('상품 검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">가격 비교 관리</h2>
        <div className="flex space-x-2">
          {selectedComparisons.length > 0 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded flex items-center"
            >
              <FiArrowRight className="mr-1"/> 선택 항목 이관 ({selectedComparisons.length})
            </button>
          )}
          <button
            onClick={handleShowAddForm}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
            disabled={isAdding}
          >
            <FiPlus className="mr-1"/> 가격 비교 추가
          </button>
        </div>
      </div>

      {/* 가격 비교 추가 폼 */}
      {isAdding && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-3">새 가격 비교 추가</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">판매처</label>
              <select
                name="sellerSiteId"
                value={formData.sellerSiteId}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                required
              >
                <option value="">판매처 선택</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                placeholder="가격 입력"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">판매 URL</label>
              <input
                type="url"
                name="sellerUrl"
                value={formData.sellerUrl}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                placeholder="https://example.com/product"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
            >
              취소
            </button>
            <button
              onClick={handleAddComparison}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              추가하기
            </button>
          </div>
        </div>
      )}

      {/* 가격 비교 목록 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : comparisons.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">선택</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">판매처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마지막 업데이트</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {comparisons.map((comparison) => (
              <tr key={comparison.id}>
                {editingId === comparison.id ? (
                  // 편집 모드
                  <>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        disabled
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-2">
                      <input type="hidden" name="id" value={formData.id}/>
                      <input type="hidden" name="productId" value={comparison.productId}/>
                      <input type="hidden" name="sellerSiteId" value={formData.sellerSiteId}/>
                      <span>{sites.find(site => site.id === Number(formData.sellerSiteId))?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-2">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-1 px-2 text-sm"
                        required
                      />
                    </td>
                    <td className="px-6 py-2">
                      <input type="hidden" name="sellerId" value={formData.sellerSiteId}/>
                      <a
                        href={comparison.sellerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center max-w-xs truncate"
                      >
                        <span className="truncate">판매 페이지</span>
                        <FiExternalLink className="ml-1 flex-shrink-0" size={14}/>
                      </a>
                    </td>
                    <td className="px-6 py-2">
                      {new Date(comparison.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleUpdateComparison()}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        title="저장"
                      >
                        <FiSave size={16}/>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-800"
                        title="취소"
                      >
                        <FiX size={16}/>
                      </button>
                    </td>
                  </>
                ) : (
                  // 보기 모드
                  <>
                    <td className="px-2 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedComparisons.includes(comparison.id)}
                        onChange={() => {
                          if (selectedComparisons.includes(comparison.id)) {
                            setSelectedComparisons(selectedComparisons.filter(id => id !== comparison.id));
                          } else {
                            setSelectedComparisons([...selectedComparisons, comparison.id]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {comparison.SellerSite?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {comparison.price.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <a
                          href={comparison.sellerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center max-w-xs truncate"
                        >
                          <span className="truncate">판매 페이지</span>
                          <FiExternalLink className="ml-1 flex-shrink-0" size={14}/>
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(comparison.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(comparison)}
                        className="text-indigo-600 hover:text-indigo-800 mr-3"
                        title="수정"
                      >
                        <FiEdit size={16}/>
                      </button>
                      <button
                        onClick={() => handleDeleteComparison(comparison.id)}
                        className="text-red-600 hover:text-red-800"
                        title="삭제"
                      >
                        <FiTrash2 size={16}/>
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <FiSearch className="mx-auto mb-2" size={24}/>
          <p>등록된 가격 비교 정보가 없습니다.</p>
          <p className="text-sm mt-1">새 가격 비교를 추가하려면 상단의 &apos;가격 비교 추가&apos; 버튼을 클릭하세요.</p>
        </div>
      )}

      {/* 가격 비교 이관 모달 */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowTransferModal(false)}></div>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative z-10">
            <h3 className="text-lg font-medium mb-4">가격 비교 이관</h3>
            <p className="text-sm text-gray-500 mb-4">
              선택한 가격 비교 정보를 다른 상품으로 이관합니다.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">이관할 상품</label>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch().then();
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-md py-2 px-3 text-sm"
                  placeholder="상품명 검색"
                />
                <button
                  onClick={handleSearch}
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                  disabled={isSearching}
                >
                  {isSearching ? '검색 중...' : '검색'}
                </button>
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">검색 결과</label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className={`px-4 py-2 cursor-pointer ${selectedProductId === product.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      [{product.id}] - {product.visibleName}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowTransferModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded mr-2"
              >
                취소
              </button>
              <button
                onClick={handleTransferComparisons}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                disabled={transferLoading}
              >
                {transferLoading ? '이관 중...' : '이관하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceComparisonManager;