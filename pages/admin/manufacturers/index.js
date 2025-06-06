import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import AdminPagination from '../../../components/admin/AdminPagination';
import {getSession} from 'next-auth/react';

export default function ManufacturersPage() {
  const router = useRouter();
  const [manufacturers, setManufacturers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [manufacturerName, setManufacturerName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentManufacturer, setCurrentManufacturer] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 제조사 목록 불러오기
  const fetchManufacturers = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/manufacturers?page=${page}&search=${encodeURIComponent(search || '')}`
      );
      if (!res.ok) throw new Error('서버 오류가 발생했습니다.');

      const data = await res.json();
      setManufacturers(data.data.manufacturers);
      setTotalPages(data.data.pagination.totalPages);
      setCurrentPage(data.data.pagination.currentPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드시 데이터 가져오기
  useEffect(() => {
    fetchManufacturers(currentPage, searchTerm);
  }, [currentPage]);

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // 검색시 첫 페이지로 이동
    fetchManufacturers(1, searchTerm);
  };

  // 제조사 추가
  const handleAddManufacturer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!manufacturerName.trim()) {
        setError('회사명을 입력해주세요.');
        return;
      }

      const res = await fetch('/api/admin/manufacturers', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: manufacturerName.trim()}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '서버 오류가 발생했습니다.');

      setSuccess('제조사가 추가되었습니다.');
      setManufacturerName('');
      setFormOpen(false);
      fetchManufacturers(currentPage, searchTerm);
    } catch (err) {
      setError(err.message);
    }
  };

  // 제조사 수정 모드 활성화
  const handleEditMode = (manufacturer) => {
    setEditMode(true);
    setFormOpen(true);
    setCurrentManufacturer(manufacturer);
    setManufacturerName(manufacturer.name);
  };

  // 제조사 수정
  const handleUpdateManufacturer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!manufacturerName.trim()) {
        setError('회사명을 입력해주세요.');
        return;
      }

      const res = await fetch(`/api/admin/manufacturers/${currentManufacturer.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: manufacturerName.trim()}),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '서버 오류가 발생했습니다.');

      setSuccess('제조사 정보가 수정되었습니다.');
      setManufacturerName('');
      setFormOpen(false);
      setEditMode(false);
      setCurrentManufacturer(null);
      fetchManufacturers(currentPage, searchTerm);
    } catch (err) {
      setError(err.message);
    }
  };

  // 제조사 삭제
  const handleDeleteManufacturer = async (id) => {
    if (!window.confirm('정말로 이 제조사를 삭제하시겠습니까?')) return;

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/manufacturers/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '서버 오류가 발생했습니다.');

      setSuccess('제조사가 삭제되었습니다.');
      fetchManufacturers(currentPage, searchTerm);
    } catch (err) {
      setError(err.message);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setEditMode(false);
    setCurrentManufacturer(null);
    setManufacturerName('');
    setFormOpen(!formOpen);
    setError('');
    setSuccess('');
  };

  return (
    <>
      <div className="p-4 bg-white shadow rounded-lg">
        <h1 className="text-2xl font-bold mb-6">제조사 관리</h1>

        {/* 알림 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* 검색 및 추가 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제조사명 검색"
              className="border rounded-l px-4 py-2 focus:outline-none"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">
              검색
            </button>
          </form>

          <button
            onClick={resetForm}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {formOpen ? '취소' : '새 제조사 추가'}
          </button>
        </div>

        {/* 제조사 추가/수정 폼 */}
        {formOpen && (
          <div className="mb-6 p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? '제조사 수정' : '새 제조사 추가'}
            </h2>
            <form onSubmit={editMode ? handleUpdateManufacturer : handleAddManufacturer} className="space-y-4">
              <div>
                <label className="block mb-1">회사명</label>
                <input
                  type="text"
                  value={manufacturerName}
                  onChange={(e) => setManufacturerName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    editMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {editMode ? '수정하기' : '추가하기'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 제조사 목록 테이블 */}
        {isLoading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : !manufacturers.length === 0 ? (
          <div className="text-center py-4">데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">회사명</th>
                <th className="py-2 px-4 border-b text-left">등록일</th>
                <th className="py-2 px-4 border-b text-center">관리</th>
              </tr>
              </thead>
              <tbody>
              {manufacturers.map((manufacturer) => (
                <tr key={manufacturer.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{manufacturer.id}</td>
                  <td className="py-2 px-4 border-b">{manufacturer.name}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(manufacturer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => handleEditMode(manufacturer)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteManufacturer(manufacturer.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
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
        destination: '/auth/signin?callbackUrl=/admin/manufacturers',
        permanent: false,
      },
    };
  }

  return {
    props: {session},
  };
}
