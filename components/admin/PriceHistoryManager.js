import {useCallback, useEffect, useState} from 'react';
import {FiEdit, FiPlus, FiSave, FiSearch, FiTrash2, FiX} from 'react-icons/fi';
import {FaArrowDown, FaArrowUp} from 'react-icons/fa';

/**
 * 가격 변동 이력 관리 컴포넌트
 * @param {object} props - 컴포넌트 프로퍼티
 * @param {string} props.productId - 상품 ID
 */
const PriceHistoryManager = ({productId}) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    id: '',
    sellerId: '',
    oldPrice: '',
    newPrice: '',
    productId: productId || '',
  });

  // 가격 변동 이력 데이터 로드
  const loadPriceHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/price-history?productId=${productId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPriceHistory(data.data);
        } else {
          console.error('가격 변동 이력 데이터 로드 실패:', data.message);
        }
      } else {
        console.error('가격 변동 이력 데이터 로드 실패:', response.statusText);
      }
    } catch (error) {
      console.error('가격 변동 이력 데이터 로드 오류:', error);
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
      loadPriceHistory().then();
      loadSellerSites().then();
    }
  }, [productId, loadPriceHistory, loadSellerSites]);

  // 폼 입력 변경 핸들러
  const handleInputChange = (e) => {
    const {name, value, type, checked} = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 편집 시작 핸들러
  const handleEdit = (history) => {
    setEditingId(history.id);
    setFormData({
      id: history.id,
      sellerId: history.sellerId,
      oldPrice: history.oldPrice.toString(),
      newPrice: history.newPrice.toString(),
      productId: history.productId,
    });
  };

  // 가격 변동 이력 수정 핸들러
  const handleUpdatePriceHistory = async () => {
    if (!formData.oldPrice || !formData.newPrice) {
      alert('이전 가격과 새 가격은 필수 입력 항목입니다.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/price-history`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          oldPrice: parseFloat(formData.oldPrice),
          newPrice: parseFloat(formData.newPrice)
        })
      });

      const result = await response.json();

      if (result.success) {
        loadPriceHistory().then();
        setEditingId(null);
        setFormData({
          id: '',
          sellerId: '',
          oldPrice: '',
          newPrice: '',
          productId: productId || '',
        });
      } else {
        alert(`가격 변동 이력 수정 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('가격 변동 이력 수정 오류:', error);
      alert('가격 변동 이력 수정 중 오류가 발생했습니다.');
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({
      id: '',
      sellerId: '',
      oldPrice: '',
      newPrice: '',
      productId: productId || '',
    });
  };

  // 가격 변동 이력 추가 폼 표시 핸들러
  const handleShowAddForm = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: '',
      sellerId: sites.length > 0 ? sites[0].id.toString() : '',
      oldPrice: '',
      newPrice: '',
      productId: productId,
    });
  };

  // 가격 변동 이력 추가 핸들러
  const handleAddPriceHistory = async () => {
    if (!formData.sellerId) {
      alert('판매처를 선택해주세요.');
      return;
    }

    if (!formData.oldPrice) {
      alert('이전 가격은 필수 입력 항목입니다.');
      return;
    }

    if (!formData.newPrice) {
      alert('새 가격은 필수 입력 항목입니다.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/price-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          sellerId: formData.sellerId,
          oldPrice: parseFloat(formData.oldPrice),
          newPrice: parseFloat(formData.newPrice)
        })
      });

      const result = await response.json();

      if (result.success) {
        loadPriceHistory().then();
        setIsAdding(false);
        setFormData({
          id: '',
          sellerId: '',
          oldPrice: '',
          newPrice: '',
          productId: productId || '',
        });
        alert('가격 변동 이력이 성공적으로 추가되었습니다.');
      } else {
        alert(`가격 변동 이력 추가 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('가격 변동 이력 추가 오류:', error);
      alert('가격 변동 이력 추가 중 오류가 발생했습니다.');
    }
  };

  // 가격 변동 이력 삭제 핸들러
  const handleDeletePriceHistory = async (id) => {
    if (!window.confirm('정말로 이 가격 변동 이력을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/price-history`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id})
      });

      const result = await response.json();

      if (result.success) {
        loadPriceHistory().then();
        alert('가격 변동 이력이 성공적으로 삭제되었습니다.');
      } else {
        alert(`가격 변동 이력 삭제 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('가격 변동 이력 삭제 오류:', error);
      alert('가격 변동 이력 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">가격 변동 이력 관리</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleShowAddForm}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
            disabled={isAdding}
          >
            <FiPlus className="mr-1"/> 가격 변동 이력 추가
          </button>
        </div>
      </div>

      {/* 가격 변동 이력 추가 폼 */}
      {isAdding && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-3">새 가격 변동 이력 추가</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">판매처</label>
              <select
                name="sellerId"
                value={formData.sellerId}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">이전 가격</label>
              <input
                type="number"
                name="oldPrice"
                value={formData.oldPrice}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                placeholder="이전 가격 입력"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">새 가격</label>
              <input
                type="number"
                name="newPrice"
                value={formData.newPrice}
                onChange={handleInputChange}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                placeholder="새 가격 입력"
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
              onClick={handleAddPriceHistory}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              추가하기
            </button>
          </div>
        </div>
      )}

      {/* 가격 변동 이력 목록 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : priceHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">판매처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이전 가격</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">새 가격</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">변동</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {priceHistory.map((history) => (
              <tr key={history.id}>
                {editingId === history.id ? (
                  // 편집 모드
                  <>
                    <td className="px-6 py-2">
                      {new Date(history.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-2">
                      <input type="hidden" name="id" value={formData.id}/>
                      <input type="hidden" name="productId" value={history.productId}/>
                      <select
                        name="sellerId"
                        value={formData.sellerId}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-1 px-2 text-sm"
                        required
                      >
                        <option value="">판매처 선택</option>
                        {sites.map(site => (
                          <option key={site.id} value={site.id}>
                            {site.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-2">
                      <input
                        type="number"
                        name="oldPrice"
                        value={formData.oldPrice}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-1 px-2 text-sm"
                        required
                      />
                    </td>
                    <td className="px-6 py-2">
                      <input
                        type="number"
                        name="newPrice"
                        value={formData.newPrice}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 rounded-md py-1 px-2 text-sm"
                        required
                      />
                    </td>
                    <td className="px-6 py-2">
                      {/* 편집 중에는 변동 정보 표시 안함 */}
                      <span className="text-gray-400">편집 중...</span>
                    </td>
                    <td className="px-6 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleUpdatePriceHistory()}
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
                      {new Date(history.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {history.SellerSite?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {history.oldPrice.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {history.newPrice.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {history.priceDifference < 0 ? (
                          <>
                            <FaArrowDown className="text-green-500 mr-1"/>
                            <span className="text-green-500 font-medium">
                              {Math.abs(history.priceDifference).toLocaleString()}원 ({Math.abs(history.percentageChange).toFixed(1)}%)
                            </span>
                          </>
                        ) : history.priceDifference > 0 ? (
                          <>
                            <FaArrowUp className="text-red-500 mr-1"/>
                            <span className="text-red-500 font-medium">
                              {history.priceDifference.toLocaleString()}원 ({history.percentageChange.toFixed(1)}%)
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">변동 없음</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(history)}
                        className="text-indigo-600 hover:text-indigo-800 mr-3"
                        title="수정"
                      >
                        <FiEdit size={16}/>
                      </button>
                      <button
                        onClick={() => handleDeletePriceHistory(history.id)}
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
          <p>등록된 가격 변동 이력이 없습니다.</p>
          <p className="text-sm mt-1">새 가격 변동 이력을 추가하려면 상단의 &apos;가격 변동 이력 추가&apos; 버튼을 클릭하세요.</p>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryManager;