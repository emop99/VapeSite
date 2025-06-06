import {useCallback, useEffect, useState} from 'react';
import {FiEdit, FiExternalLink, FiPlus, FiSave, FiSearch, FiTrash2, FiX} from 'react-icons/fi';

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

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">가격 비교 관리</h2>
        <button
          onClick={handleShowAddForm}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
          disabled={isAdding}
        >
          <FiPlus className="mr-1"/> 가격 비교 추가
        </button>
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
    </div>
  );
};

export default PriceComparisonManager;
