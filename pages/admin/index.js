import {useState, useEffect} from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {FiUsers, FiBox, FiShoppingBag, FiUser} from 'react-icons/fi';

// 대시보드 페이지
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentUsers: [],
    recentProducts: [],
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      totalCompanies: 0
    }
  });

  // 대시보드 데이터 불러오기
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');

        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error('대시보드 데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Head>
        <title>관리자 대시보드 - 쥬스고블린</title>
      </Head>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 통계 카드 1 - 총 상품 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">총 상품</p>
                  <p className="text-2xl font-semibold mt-2">{dashboardData.stats.totalProducts.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <FiBox className="w-6 h-6 text-blue-500"/>
                </div>
              </div>
            </div>

            {/* 통계 카드 2 - 제조사 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">제조사</p>
                  <p className="text-2xl font-semibold mt-2">{dashboardData.stats.totalCompanies.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <FiShoppingBag className="w-6 h-6 text-green-500"/>
                </div>
              </div>
            </div>

            {/* 통계 카드 3 - 총 회원 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">총 회원</p>
                  <p className="text-2xl font-semibold mt-2">{dashboardData.stats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <FiUsers className="w-6 h-6 text-purple-500"/>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 활동 섹션 */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 최근 등록된 제품 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">최근 등록된 상품</h2>
              </div>
              {dashboardData.recentProducts.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {dashboardData.recentProducts.map((product) => (
                    <li key={product.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                          <FiBox className="h-6 w-6 text-gray-500"/>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                        <div className="ml-auto text-xs text-gray-500">
                          {formatDate(product.createdAt)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  등록된 상품이 없습니다.
                </div>
              )}
              <div className="p-4 border-t border-gray-200">
                <Link href="/admin/products" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  모든 상품 보기
                </Link>
              </div>
            </div>

            {/* 최근 등록된 사용자 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">최근 등록된 회원</h2>
              </div>
              {dashboardData.recentUsers.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {dashboardData.recentUsers.map((user) => (
                    <li key={user.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <FiUser className="h-5 w-5 text-gray-600"/>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="ml-auto text-xs text-gray-500">
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  등록된 회원이 없습니다.
                </div>
              )}
              <div className="p-4 border-t border-gray-200">
                <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  모든 회원 보기
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};