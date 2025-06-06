import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {getSession} from 'next-auth/react';
import AdminPagination from '../../../components/admin/AdminPagination';
import {FiFilter, FiRefreshCw} from 'react-icons/fi';

export default function CrawlerLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  // 필터링 상태
  const [filters, setFilters] = useState({
    level: '',
    logger: '',
    message: '',
    startDate: '',
    endDate: '',
    limit: '20' // 기본 표시 개수 20개
  });

  // 필터 패널 표시 여부
  const [showFilters, setShowFilters] = useState(true);

  // 로그 데이터 불러오기
  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      // 필터를 쿼리 파라미터로 변환
      const queryParams = new URLSearchParams({
        page,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      }).toString();

      const response = await fetch(`/api/admin/crawler-logs?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '로그 데이터를 불러오는 중 오류가 발생했습니다.');
      }

      setLogs(data.data.logs);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('로그 불러오기 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // 페이지 변경 시 로그 불러오기
  useEffect(() => {
    // 로그 데이터 불러오기
    fetchLogs(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setPagination(prev => ({...prev, currentPage: page}));
  };

  // 필터 적용 핸들러
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPagination(prev => ({...prev, currentPage: 1})); // 필터 적용 시 첫 페이지로 이동
    fetchLogs(1).then();
    setShowFilters(false); // 필터 패널 닫기
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilters({
      level: '',
      logger: '',
      message: '',
      startDate: '',
      endDate: '',
      limit: '20' // 기본 표시 개수 20개
    });
    setPagination(prev => ({...prev, currentPage: 1}));
    fetchLogs(1).then();
  };

  // 로그 레벨에 따른 배지 스타일
  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';

    // 예시: "2025-06-06T12:49:56.404477" 형식 처리
    // 타임스탬프를 수동으로 파싱
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hourStr, minuteStr, secondStr] = timePart.split(':');
    const [second] = secondStr.split('.');

    // Date 객체는 월을 0-11로 사용하므로 월에서 1을 빼줍니다
    const date = new Date(year, month - 1, day, hourStr, minuteStr, second);

    // UTC 기준으로 Date 객체가 생성되므로, 한국 시간대(UTC+9)로 수동 변환
    date.setHours(date.getHours() + 9);

    return date.toLocaleString();
  };

  return (
    <>
      <div className="p-4 bg-white shadow rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">크롤링 작업 로그</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <FiFilter className="mr-2"/>
              필터
            </button>
            <button
              onClick={() => fetchLogs(pagination.currentPage)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <FiRefreshCw className="mr-2"/>
              새로고침
            </button>
          </div>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 border rounded-md">
            <h3 className="font-medium mb-3">로그 필터링</h3>
            <form onSubmit={handleApplyFilters}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">로그 레벨</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={filters.level}
                    onChange={(e) => setFilters({...filters, level: e.target.value})}
                  >
                    <option value="">모든 레벨</option>
                    <option value="INFO">정보</option>
                    <option value="ERROR">오류</option>
                    <option value="WARNING">경고</option>
                    <option value="DEBUG">디버그</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">로거 이름</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={filters.logger}
                    onChange={(e) => setFilters({...filters, logger: e.target.value})}
                    placeholder="로거 이름"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">메시지</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    value={filters.message}
                    onChange={(e) => setFilters({...filters, message: e.target.value})}
                    placeholder="메시지 내용"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                  <input
                    type="date"
                    className="w-full border rounded-md px-3 py-2"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                  <input
                    type="date"
                    className="w-full border rounded-md px-3 py-2"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">표시 개수</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={filters.limit}
                    onChange={(e) => setFilters({...filters, limit: e.target.value})}
                  >
                    <option value="20">20개</option>
                    <option value="50">50개</option>
                    <option value="100">100개</option>
                    <option value="200">200개</option>
                    <option value="500">500개</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  초기화
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  적용
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* 로그 테이블 */}
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2 text-gray-500">로그를 불러오는 중...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center bg-gray-50 rounded-md">
            <p className="text-gray-500">조회된 로그가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  레벨
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  로거
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  메시지
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  앱 정보
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(log.timestamp)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadgeClass(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.logger_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-lg truncate" title={log.message}>
                      {log.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{log.app_name}</div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <AdminPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/admin/crawler-logs',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
