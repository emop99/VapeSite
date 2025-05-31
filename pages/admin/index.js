import Link from 'next/link';
import Head from 'next/head';
import {FiUsers, FiBox, FiShoppingBag, FiGlobe, FiBarChart2, FiSettings, FiUser} from 'react-icons/fi';

// 대시보드 페이지
export default function AdminDashboard () {
  return (
    <>
      <Head>
        <title>관리자 대시보드 - VapeSite</title>
      </Head>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 통계 카드 1 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">총 사용자</p>
              <p className="text-2xl font-semibold mt-2">2,345</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              5.27% 증가
            </p>
            <p className="text-xs text-gray-500 mt-1">지난달 대비</p>
          </div>
        </div>

        {/* 통계 카드 2 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">총 제품</p>
              <p className="text-2xl font-semibold mt-2">1,247</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <FiBox className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              3.14% 증가
            </p>
            <p className="text-xs text-gray-500 mt-1">지난달 대비</p>
          </div>
        </div>

        {/* 통계 카드 3 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">제조사</p>
              <p className="text-2xl font-semibold mt-2">89</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <FiShoppingBag className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              2.35% 증가
            </p>
            <p className="text-xs text-gray-500 mt-1">지난달 대비</p>
          </div>
        </div>

        {/* 통계 카드 4 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">리퀴드 사이트</p>
              <p className="text-2xl font-semibold mt-2">32</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <FiGlobe className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-green-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              1.58% 증가
            </p>
            <p className="text-xs text-gray-500 mt-1">지난달 대비</p>
          </div>
        </div>
      </div>

      {/* 최근 활동 섹션 */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최근 등록된 사용자 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">최근 등록된 사용자</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((item) => (
              <li key={item} className="p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <FiUser className="h-5 w-5 text-gray-600" />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">사용자 {item}</div>
                    <div className="text-sm text-gray-500">user{item}@example.com</div>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-gray-200">
            <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              모든 사용자 보기
            </Link>
          </div>
        </div>

        {/* 최근 등록된 제품 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">최근 등록된 제품</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((item) => (
              <li key={item} className="p-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                    <FiBox className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">제품 {item}</div>
                    <div className="text-sm text-gray-500">카테고리 {item % 3 + 1}</div>
                  </div>
                  <div className="ml-auto text-xs text-gray-500">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-gray-200">
            <Link href="/admin/products" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              모든 제품 보기
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}