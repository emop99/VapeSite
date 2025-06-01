import {useState, useEffect, useCallback} from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {FiEdit, FiTrash2, FiPlus, FiSearch, FiFilter} from 'react-icons/fi';
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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [hasImage, setHasImage] = useState(''); // 이미지 유무 필터링 ('yes', 'no', '')

  // 상품 데이터 불러오기
  const fetchProducts = useCallback(
    async (page = 1, search = '', category = '', company = '', imageFilter = '') => {
      try {
        setLoading(true);

        // 쿼리 파라미터 구성
        const queryParams = new URLSearchParams({
          page,
          limit: pagination.limit,
          search,
          category,
          company
        });

        // 이미지 필터가 있는 경우 추가
        if (imageFilter) {
          queryParams.append('hasImage', imageFilter);
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
    [pagination.limit]
  );

  // URL 쿼리에서 초기 검색 조건 설정
  useEffect(() => {
    if (router.isReady) {
      const { search = '', category = '', company = '', page = '1', hasImage = '' } = router.query;
      setSearchTerm(search);
      setSelectedCategory(category);
      setSelectedCompany(company);
      setHasImage(hasImage);

      // 회사 ID에 해당하는 이름을 찾아서 검색어에 설정
      if (company && filters.companies?.length > 0) {
        const companyObj = filters.companies.find(c => c.id === company);
        if (companyObj) {
          setCompanySearchTerm(companyObj.name);
        }
      }

      fetchProducts(parseInt(page), search, category, company, hasImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query, fetchProducts]);

  // URL 업데이트 함수
  const updateUrlWithFilters = (
    page = pagination.currentPage,
    search = searchTerm,
    category = selectedCategory,
    company = selectedCompany,
    imageFilter = hasImage
  ) => {
    const query = { page: page.toString() };
    if (search) query.search = search;
    if (category) query.category = category;
    if (company) query.company = company;
    if (imageFilter) query.hasImage = imageFilter;

    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  // 카테고리 변경 처리
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    updateUrlWithFilters(1, searchTerm, newCategory, selectedCompany, hasImage);
  }

  // 제조사 변경 처리
  const handleCompanyChange = (e) => {
    const newCompany = e.target.value;
    setSelectedCompany(newCompany);
    updateUrlWithFilters(1, searchTerm, selectedCategory, newCompany, hasImage);
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
      updateUrlWithFilters(1, searchTerm, selectedCategory, selectedComp.id, hasImage);
    } else {
      // 일치하는 회사가 없으면 선택 초기화
      setSelectedCompany('');
      updateUrlWithFilters(1, searchTerm, selectedCategory, '', hasImage);
    }
  }

  // 이미지 유무 필터링 처리
  const handleImageFilterChange = (e) => {
    const imageFilter = e.target.value;
    setHasImage(imageFilter);
    updateUrlWithFilters(1, searchTerm, selectedCategory, selectedCompany, imageFilter);
  }

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    updateUrlWithFilters(1, searchTerm, selectedCategory, selectedCompany, hasImage);
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
          fetchProducts(pagination.currentPage, searchTerm, selectedCategory, selectedCompany, hasImage);
        }
      } catch (error) {
        console.error('상품 삭제 오류:', error);
        alert('상품 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 페이지네이션 처리
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    updateUrlWithFilters(page, searchTerm, selectedCategory, selectedCompany, hasImage);
  };

  // 링크 생성 - 현재 검색 필터 상태를 유지하는 링크 URL 생성
  const getLinkWithCurrentFilters = (baseUrl) => {
    const query = {};
    if (searchTerm) query.search = searchTerm;
    if (selectedCategory) query.category = selectedCategory;
    if (selectedCompany) query.company = selectedCompany;
    if (hasImage) query.hasImage = hasImage;
    if (pagination.currentPage > 1) query.page = pagination.currentPage;

    // 쿼리 파라미터가 있는 경우 추가
    const queryString = new URLSearchParams(query).toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
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
              <input
                type="text"
                placeholder="상품명 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <option key={company.id} value={company.name} />
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
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">상품명</th>
                  <th className="py-3 px-4 text-left">카테고리</th>
                  <th className="py-3 px-4 text-left">제조사</th>
                  <th className="py-3 px-4 text-left">등록일</th>
                  <th className="py-3 px-4 text-center">관리</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{product.id}</td>
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">{product.ProductCategory?.name || '-'}</td>
                      <td className="py-3 px-4">{product.Company?.name || '-'}</td>
                      <td className="py-3 px-4">
                        {new Date(product.createdAt).toLocaleDateString()}
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
                    <td colSpan="6" className="py-10 px-4 text-center text-gray-500">
                      상품이 없습니다. 새 상품을 추가해주세요.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 컴포넌트 */}
            <AdminPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </>
  );
};

