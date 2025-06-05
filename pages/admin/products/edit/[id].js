import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import ProductForm from '../../../../components/admin/ProductForm';
import PriceComparisonManager from '../../../../components/admin/PriceComparisonManager';
import Head from "next/head";

export default function EditProduct() {
  const router = useRouter();
  const {id, search, category, company, page} = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    productId: id || '',
    visibleName: '',
    productGroupingName: '',
    description: '',
    categoryId: '',
    companyId: '',
    imageUrl: '',
    stock: '',
    isShow: true,
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
          // 폼 데이터 초기화 - productCategoryId를 categoryId로 매핑
          setFormData({
            productId: result.data.id || id,
            visibleName: result.data.visibleName || '',
            productGroupingName: result.data.productGroupingName || '',
            description: result.data.description || '',
            categoryId: result.data.productCategoryId || '',
            companyId: result.data.companyId || '',
            imageUrl: result.data.imageUrl || '',
            stock: result.data.stock ? String(result.data.stock) : '',
            isShow: result.data.isShow !== undefined ? result.data.isShow : true,
          });

          console.log('로드된 상품 데이터:', result.data);
        }

        // 카테고리와 제조사 정보 가져오기
        const filtersResponse = await fetch('/api/admin/products?limit=1');
        if (filtersResponse.ok) {
          const filtersResult = await filtersResponse.json();
          if (filtersResult.success) {
            setCategories(filtersResult.data.filters.categories);
            setCompanies(filtersResult.data.filters.companies);
            console.log('카테고리:', filtersResult.data.filters.categories);
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
          visibleName: formData.visibleName,
          productGroupingName: formData.productGroupingName,
          description: formData.description,
          categoryId: formData.categoryId,
          companyId: formData.companyId || null,
          imageUrl: formData.imageUrl,
          stock: formData.stock ? parseInt(formData.stock) : 0,
          isShow: formData.isShow,
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
    history.back();
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

        {/* 가격 비교 관리 컴포넌트 (로딩 중이 아닐 때만 표시) */}
        {!loading && id && <PriceComparisonManager productId={id}/>}
      </div>
    </>
  );
};

