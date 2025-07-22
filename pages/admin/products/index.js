import {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {FiChevronDown, FiChevronUp, FiEdit, FiEye, FiEyeOff, FiFilter, FiPlus, FiSearch, FiTrash2} from 'react-icons/fi';
import AdminPagination from '../../../components/admin/AdminPagination';

// 상품 관리 페이지
export default function ProductsManagement() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [filters, setFilters] = useState({
    categories: [],
    companies: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'name', 'id'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [hasImage, setHasImage] = useState(''); // 이미지 유무 필터링 ('yes', 'no', '')
  const [isShow, setIsShow] = useState(''); // 노출 여부 필터링 ('yes', 'no', '')
  const [updatingVisibility, setUpdatingVisibility] = useState(null); // 노출 상태 업데이트 중인 상품 ID
  const [pageSize, setPageSize] = useState(10); // 페이지당 상품 개수 (기본값 10)
  // 체크박스 및 일괄 작업 관련 상태 추가
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkCompany, setBulkCompany] = useState('');
  const [processingBulkAction, setProcessingBulkAction] = useState(false);
  const [bulkActionResult, setBulkActionResult] = useState({success: 0, failed: 0});
  // 정렬 관련 상태 추가
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // 상품 데이터 불러오기
  const fetchProducts = useCallback(
    async (page = 1, search = '', category = '', company = '', imageFilter = '', showFilter = '', limit = 10, orderField = sortField, order = sortOrder, type = searchType) => {
      try {
        setLoading(true);

        // 쿼리 파라미터 구성
        const queryParams = new URLSearchParams({
          page,
          limit,
          search,
          searchType: type,
          category,
          company,
          sortField: orderField,
          sortOrder: order
        });

        // 이미지 필터가 있는 경우 추가
        if (imageFilter) {
          queryParams.append('hasImage', imageFilter);
        }

        // 노출 여부 필터가 있는 경우 추가
        if (showFilter) {
          queryParams.append('isShow', showFilter);
        }

        const response = await fetch(`/api/admin/products?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }

        const result = await response.json();

        if (result.success) {
          setProducts(result.data.products);
          setPagination(result.data.pagination);
          setFilters(result.data.filters);

          // API 응답에서 정렬 정보 업데이트
          if (result.data.sort) {
            setSortField(result.data.sort.field);
            setSortOrder(result.data.sort.order);
          }

          // 회사 ID에 해당하는 이름을 찾아서 검색어에 설정
          if (company && result.data.filters.companies?.length > 0) {
            const companyObj = result.data.filters.companies.find(c => c.id === parseInt(company));
            if (companyObj) {
              setCompanySearchTerm(companyObj.name);
            }
          }
        }
      } catch (error) {
        console.error('상품 데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortField, sortOrder]
  );

  // URL 쿼리에서 초기 검색 조건 설정
  useEffect(() => {
    if (router.isReady) {
      const {search = '', searchType = 'all', category = '', company = '', page = '1', hasImage = '', isShow = '', limit = '10'} = router.query;
      setSearchTerm(search);
      setSearchType(searchType);
      setSelectedCategory(category);
      setSelectedCompany(company);
      setHasImage(hasImage);
      setIsShow(isShow);
      setPageSize(parseInt(limit));

      // 회사 ID에 해당하는 이름을 찾아서 검색어에 설정
      if (company && filters.companies?.length > 0) {
        const companyObj = filters.companies.find(c => c.id === company);
        if (companyObj) {
          setCompanySearchTerm(companyObj.name);
        }
      }

      fetchProducts(parseInt(page), search, category, company, hasImage, isShow, parseInt(limit), sortField, sortOrder, searchType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query, fetchProducts]);

  // URL 업데이트 함수
  const updateUrlWithFilters = (
    page = pagination.currentPage,
    search = searchTerm,
    category = selectedCategory,
    company = selectedCompany,
    imageFilter = hasImage,
    showFilter = isShow,
    limit = pageSize,
    orderField = sortField,
    order = sortOrder,
    type = searchType
  ) => {
    const query = {page: page.toString(), limit: limit.toString()};
    if (search) query.search = search;
    if (type) query.searchType = type;
    if (category) query.category = category;
    if (company) query.company = company;
    if (imageFilter) query.hasImage = imageFilter;
    if (showFilter) query.isShow = showFilter;
    if (orderField) query.sortField = orderField;
    if (order) query.sortOrder = order;

    router.push({
      pathname: router.pathname,
      query
    }, undefined, {shallow: true});
  };

  // 카테고리 변경 처리
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    updateUrlWithFilters(1, searchTerm, newCategory, selectedCompany, hasImage, isShow);
  }

  // 제조사 검색어 변경 처리
  const handleCompanySearchChange = (e) => {
    setCompanySearchTerm(e.target.value);
  }

  // 제조사 선택 처리
  const handleCompanySelection = () => {
    // 입력된 검색어와 일치하는 회사 찾기
    const selectedComp = filters.companies?.find(
      company => company.name.toLowerCase() === companySearchTerm.toLowerCase()
    );

    // 일치하는 회사가 있으면 해당 ID를 선택
    if (selectedComp) {
      setSelectedCompany(selectedComp.id);
      updateUrlWithFilters(1, searchTerm, selectedCategory, selectedComp.id, hasImage, isShow);
    } else {
      // 일치하는 회사가 없으면 선택 초기화
      setSelectedCompany('');
      updateUrlWithFilters(1, searchTerm, selectedCategory, '', hasImage, isShow);
    }
  }

  // 이미지 유무 필터링 처리
  const handleImageFilterChange = (e) => {
    const imageFilter = e.target.value;
    setHasImage(imageFilter);
    updateUrlWithFilters(1, searchTerm, selectedCategory, selectedCompany, imageFilter, isShow);
  }

  // 노출 여부 필터링 처리
  const handleIsShowFilterChange = (e) => {
    const showFilter = e.target.value;
    setIsShow(showFilter);
    updateUrlWithFilters(1, searchTerm, selectedCategory, selectedCompany, hasImage, showFilter);
  }

  // 페이지당 상품 개수 변경 처리
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    updateUrlWithFilters(1, searchTerm, selectedCategory, selectedCompany, hasImage, isShow, newSize);
  }

  // 검색 타입 변경 처리
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    updateUrlWithFilters(1, searchTerm, selectedCategory, selectedCompany, hasImage, isShow, pageSize, sortField, sortOrder, searchType);
  };

  // 상품 삭제
  const handleDeleteProduct = async (id) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('상품 삭제에 실패했습니다');
        }

        const result = await response.json();

        if (result.success) {
          alert('상품이 성공적으로 삭제되었습니다.');
          // 현재 페이지의 쿼리 파라미터를 유지하며 데이터 다시 불러오기
          fetchProducts(pagination.currentPage, searchTerm, selectedCategory, selectedCompany, hasImage, isShow, pageSize);
        }
      } catch (error) {
        console.error('상품 삭제 오류:', error);
        alert('상품 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 노출 상태 토글
  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      setUpdatingVisibility(id);

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({isShow: !currentVisibility}),
      });

      if (!response.ok) {
        throw new Error('상품 노출 상태 변경에 실패했습니다');
      }

      const result = await response.json();

      if (result.success) {
        // 성공 시 상품 목록에서 해당 상품의 isShow 상태만 갱신
        setProducts(products.map(product =>
          product.id === id ? {...product, isShow: !currentVisibility} : product
        ));
      }
    } catch (error) {
      console.error('상품 노출 상태 변경 오류:', error);
      alert('상품 노출 상태 변경 중 오류가 발생했습니다.');
    } finally {
      setUpdatingVisibility(null);
    }
  };

  // 페이지네이션 처리
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    updateUrlWithFilters(page, searchTerm, selectedCategory, selectedCompany, hasImage, isShow);
  };

  // 링크 생성 - 현재 검색 필터 상태를 유지하는 링크 URL 생성
  const getLinkWithCurrentFilters = (baseUrl) => {
    const query = {};
    if (searchTerm) query.search = searchTerm;
    if (searchType !== 'all') query.searchType = searchType;
    if (selectedCategory) query.category = selectedCategory;
    if (selectedCompany) query.company = selectedCompany;
    if (hasImage) query.hasImage = hasImage;
    if (isShow) query.isShow = isShow;
    if (pageSize !== 10) query.limit = pageSize;
    if (pagination.currentPage > 1) query.page = pagination.currentPage;

    // 쿼리 파라미터가 있는 경우 추가
    const queryString = new URLSearchParams(query).toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // 선택된 상품 ID 목록 업데이트
  const updateSelectedProducts = (id) => {
    setSelectedProducts(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(pid => pid !== id) // 이미 선택된 상품이면 목록에서 제거
        : [...prevSelected, id] // 새로 선택된 상품 ID 추가
    );
  };

  // 전체 선택/해제 처리
  const handleSelectAllChange = () => {
    if (selectAll) {
      // 전체 선택 해제
      setSelectAll(false);
      setSelectedProducts([]);
    } else {
      // 전체 선택
      setSelectAll(true);
      setSelectedProducts(products.map(product => product.id));
    }
  };

  // 개별 상품 선택 처리
  const handleProductSelect = (id) => {
    updateSelectedProducts(id);
  };

  // 일괄 작업 유형 변경 처리
  const handleBulkActionTypeChange = (e) => {
    setBulkActionType(e.target.value);
  };

  // 일괄 작업 수행
  const handleBulkAction = async () => {
    if (selectedProducts.length === 0) {
      alert('일괄 작업을 수행할 상품을 선택해주세요.');
      return;
    }

    if (bulkActionType === 'delete') {
      if (!window.confirm('선택한 상품을 정말로 삭제하시겠습니까?')) {
        return;
      }
    }

    setProcessingBulkAction(true);
    setBulkActionResult({success: 0, failed: 0});

    try {
      // 선택한 상품 ID로 일괄 작업 수행
      const response = await fetch('/api/admin/products/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: bulkActionType,
          productIds: selectedProducts,
          company: bulkCompany // 회사 정보 추가
        }),
      });

      if (!response.ok) {
        throw new Error('일괄 작업에 실패했습니다');
      }

      const result = await response.json();

      if (result.success) {
        alert('일괄 작업이 성공적으로 완료되었습니다.');
        setBulkActionResult(result.data);
        // 작업 성공/실패에 따라 상태 업데이트
        setProducts(products.filter(product => !selectedProducts.includes(product.id)));
        setSelectedProducts([]);
        setSelectAll(false);
        fetchProducts(pagination.currentPage, searchTerm, selectedCategory, selectedCompany, hasImage, isShow, pageSize).then();
      } else {
        alert('일괄 작업에 실패했습니다: ' + (result.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('일괄 작업 오류:', error);
      alert('일괄 작업 중 오류가 발생했습니다.');
    } finally {
      setProcessingBulkAction(false);
    }
  };

  // 정렬 필드 변경 처리
  const handleSortChange = (field) => {
    let newOrder = 'ASC';
    if (sortField === field && sortOrder === 'ASC') {
      newOrder = 'DESC';
    }
    setSortField(field);
    setSortOrder(newOrder);
    updateUrlWithFilters(1, searchTerm, selectedCategory, selectedCompany, hasImage, isShow, pageSize, field, newOrder);
  };

  return (
    <>
      <Head>
        <title>상품 관리 - 관리자 페이지</title>
      </Head>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* 상단 필터 및 검색 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">상품 관리</h1>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex">
              <select
                value={searchType}
                onChange={handleSearchTypeChange}
                className="border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="name">상품명</option>
                <option value="id">상품 번호</option>
              </select>
              <input
                type="text"
                placeholder={searchType === 'id' ? "상품 번호로 검색..." : searchType === 'name' ? "상품명으로 검색..." : "상품명 또는 상품 번호로 검색..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-y border-r border-gray-300 px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
              >
                <FiSearch/>
              </button>
            </form>

            <Link
              href={getLinkWithCurrentFilters("/admin/products/add")}
              className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-green-700 transition-colors"
            >
              <FiPlus className="mr-2"/>
              상품 추가
            </Link>
          </div>
        </div>

        {/* 필터 옵션 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="block w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">모든 카테고리</option>
                {filters.categories?.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400"/>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제조사</label>
            <div className="relative">
              <input
                type="text"
                placeholder="제조사 검색..."
                value={companySearchTerm}
                onChange={handleCompanySearchChange}
                onBlur={handleCompanySelection}
                list="company-options"
                className="block w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <datalist id="company-options">
                {filters.companies?.map(company => (
                  <option key={company.id} value={company.name}/>
                ))}
              </datalist>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400"/>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이미지 유무</label>
            <div className="relative">
              <select
                value={hasImage}
                onChange={handleImageFilterChange}
                className="block w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">모든 상품</option>
                <option value="yes">이미지 있음</option>
                <option value="no">이미지 없음</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400"/>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">노출 상태</label>
            <div className="relative">
              <select
                value={isShow}
                onChange={handleIsShowFilterChange}
                className="block w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">모든 상품</option>
                <option value="yes">노출 상품</option>
                <option value="no">숨김 상품</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400"/>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">표시 개수</label>
            <div className="relative">
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="block w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="10">10개씩 보기</option>
                <option value="30">30개씩 보기</option>
                <option value="50">50개씩 보기</option>
                <option value="100">100개씩 보기</option>
                <option value="200">200개씩 보기</option>
                <option value="500">500개씩 보기</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400"/>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 목록 테이블 */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">선택</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">
                    상품명
                    <button
                      onClick={() => handleSortChange('visibleName')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      type="button"
                    >
                      {sortField === 'visibleName' && sortOrder === 'ASC' ? (
                        <FiChevronUp className="w-5 h-5"/>
                      ) : (
                        <FiChevronDown className="w-5 h-5"/>
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    카테고리
                    <button
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      type="button"
                    >
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    제조사
                    <button
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      type="button"
                    >
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    등록일
                    <button
                      onClick={() => handleSortChange('createdAt')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      type="button"
                    >
                      {sortField === 'createdAt' && sortOrder === 'ASC' ? (
                        <FiChevronUp className="w-5 h-5"/>
                      ) : (
                        <FiChevronDown className="w-5 h-5"/>
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-center">노출</th>
                  <th className="py-3 px-4 text-center">관리</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleProductSelect(product.id)}
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">{product.id}</td>
                      <td className="py-3 px-4">
                        <Link href="/products/[id]" as={`/products/${product.id}`} target="_blank">
                          {product.visibleName}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{product.ProductCategory?.name || '-'}</td>
                      <td className="py-3 px-4">{product.Company?.name || '-'}</td>
                      <td className="py-3 px-4">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleVisibility(product.id, product.isShow)}
                          disabled={updatingVisibility === product.id}
                          className={`p-2 rounded-full ${
                            product.isShow
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          } transition-colors`}
                          title={product.isShow ? '클릭하여 숨김 처리' : '클릭하여 공개 처리'}
                        >
                          {updatingVisibility === product.id ? (
                            <div className="w-5 h-5 border-t-2 border-current rounded-full animate-spin"></div>
                          ) : product.isShow ? (
                            <FiEye size={18}/>
                          ) : (
                            <FiEyeOff size={18}/>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={getLinkWithCurrentFilters(`/admin/products/edit/${product.id}`)}
                            className="bg-blue-500 text-white p-1.5 rounded hover:bg-blue-600 transition-colors"
                            title="수정"
                          >
                            <FiEdit size={16}/>
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                            title="삭제"
                          >
                            <FiTrash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-10 px-4 text-center text-gray-500">
                      상품이 없습니다. 새 상품을 추가해주세요.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* 페이지 및 표시 항목 정보 */}
            <div className="mt-4 mb-2 text-sm text-gray-500 text-right">
              총 {pagination.total}개 중 {(pagination.currentPage - 1) * pageSize + 1} ~ {Math.min(pagination.currentPage * pageSize, pagination.total)}개
            </div>

            {/* 페이지네이션 컴포넌트 */}
            <AdminPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />

            {/* 일괄 작업 영역 */}
            {selectedProducts.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                    선택한 상품: <span className="font-semibold">{selectedProducts.length}개</span>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={bulkActionType}
                      onChange={handleBulkActionTypeChange}
                      className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">일괄 작업 선택</option>
                      <option value="show">선택 노출</option>
                      <option value="hide">선택 숨김</option>
                      <option value="delete">선택 삭제</option>
                      <option value="company">선택 제조사 변경</option>
                    </select>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="제조사 입력 (선택 사항)"
                        value={bulkCompany}
                        onChange={(e) => setBulkCompany(e.target.value)}
                        list="bulk-company-options"
                        className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <datalist id="bulk-company-options">
                        {filters.companies?.map(company => (
                          <option key={company.id} value={company.id.toString()} label={company.name}/>
                        ))}
                      </datalist>
                    </div>

                    <button
                      onClick={handleBulkAction}
                      disabled={processingBulkAction}
                      className={`bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 transition-colors ${
                        processingBulkAction ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                      }`}
                    >
                      {processingBulkAction ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                          처리 중...
                        </>
                      ) : (
                        '일괄 작업 실행'
                      )}
                    </button>
                  </div>
                </div>

                {bulkActionResult.success > 0 && (
                  <div className="text-sm text-green-600 mb-2">
                    성공적으로 처리된 상품: {bulkActionResult.success}개
                  </div>
                )}
                {bulkActionResult.failed > 0 && (
                  <div className="text-sm text-red-600">
                    처리 실패한 상품: {bulkActionResult.failed}개
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
