import {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {FiArrowLeft} from 'react-icons/fi';
import ProductForm from '../../../../components/admin/ProductForm';

export default function EditProduct() {
  const router = useRouter();
  const {id, search, category, company, page} = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    companyId: '',
    imageUrl: '',
    stock: '',
  });

  // 목록으로 돌아가는 URL 생성
  const getBackToListUrl = () => {
    const query = {};
    if (search) query.search = search;
    if (category) query.category = category;
    if (company) query.company = company;
    if (page) query.page = page;

    const queryString = new URLSearchParams(query).toString();
    return queryString ? `/admin/products?${queryString}` : '/admin/products';
  };

  // 상품 데이터 로드
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // 상품 상세 정보 가져오기
        const response = await fetch(`/api/admin/products/${id}`);

        if (!response.ok) {
          throw new Error('상품 정보를 불러오는데 실패했습니다');
        }

        const result = await response.json();

        if (result.success && result.data) {
          // 폼 데이터 초기화
          setFormData({
            name: result.data.name || '',
            description: result.data.description || '',
            price: result.data.price ? String(result.data.price) : '',
            categoryId: result.data.categoryId || '',
            companyId: result.data.companyId || '',
            imageUrl: result.data.imageUrl || '',
            stock: result.data.stock ? String(result.data.stock) : '',
          });
        }

        // 카테고리와 제조사 정보 가져오기
        const filtersResponse = await fetch('/api/admin/products?limit=1');
        if (filtersResponse.ok) {
          const filtersResult = await filtersResponse.json();
          if (filtersResult.success) {
            setCategories(filtersResult.data.filters.categories);
            setCompanies(filtersResult.data.filters.companies);
          }
        }
      } catch (error) {
        console.error('상품 데이터 로딩 오류:', error);
        alert('상품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price ? parseInt(formData.price) : 0,
          categoryId: formData.categoryId,
          companyId: formData.companyId || null,
          imageUrl: formData.imageUrl,
          stock: formData.stock ? parseInt(formData.stock) : 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('상품 정보가 성공적으로 수정되었습니다.');
        router.push(getBackToListUrl());
      } else {
        alert(`상품 수정 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('상품 수정 오류:', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.push(getBackToListUrl());
  };

  return (
    <>
      <Head>
        <title>상품 수정 - 관리자 페이지</title>
      </Head>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* 상단 제목 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">상품 수정</h1>
          <Link
            href={getBackToListUrl()}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiArrowLeft className="mr-1"/>
            목록으로 돌아가기
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          /* 상품 수정 폼 컴포넌트 */
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            companies={companies}
            isSubmitting={saving}
            isAddMode={false}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </>
  );
};

