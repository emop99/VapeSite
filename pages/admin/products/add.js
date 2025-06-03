import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Head from 'next/head';
import ProductForm from '../../../components/admin/ProductForm';

export default function AddProduct() {
  const router = useRouter();
  const {search, category, company, page} = router.query;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryIdn: '',
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

  // 카테고리 및 제조사 데이터 로드
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const response = await fetch('/api/admin/products?limit=1');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setCategories(result.data.filters.categories);
            setCompanies(result.data.filters.companies);
          }
        }
      } catch (error) {
        console.error('필터 데이터 로딩 오류:', error);
      }
    };

    fetchFilterData();
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visibleName: formData.visibleName,
          productGroupingName: formData.productGroupingName,
          description: formData.description,
          categoryId: formData.categoryId,
          companyId: formData.companyId || null,
          imageUrl: formData.imageUrl,
          stock: formData.stock ? parseInt(formData.stock) : 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('상품이 성공적으로 등록되었습니다.');
        router.push(getBackToListUrl());
      } else {
        alert(`상품 등록 실패: ${result.message}`);
      }
    } catch (error) {
      console.error('상품 등록 오류:', error);
      alert('상품 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    history.back();
  };

  return (
    <>
      <Head>
        <title>상품 추가 - 관리자 페이지</title>
      </Head>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* 상단 제목 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">상품 추가</h1>
        </div>

        {/* 상품 추가 폼 컴포넌트 */}
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          companies={companies}
          isSubmitting={loading}
          isAddMode={true}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
};

