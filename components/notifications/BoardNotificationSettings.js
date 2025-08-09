import React, {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';

const BoardNotificationSettings = () => {
  const {data: session} = useSession();
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');

  // 게시판 알림 설정 조회
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/board/preferences');

      if (!response.ok) {
        throw new Error('알림 설정을 불러올 수 없습니다.');
      }

      const data = await response.json();
      setPreferences(data.preferences || []);
    } catch (err) {
      console.error('알림 설정 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 게시판 알림 설정 업데이트
  const updatePreference = async (boardId, enabled) => {
    try {
      setUpdating(prev => ({...prev, [boardId]: true}));

      const response = await fetch('/api/notifications/board/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId,
          enabled
        }),
      });

      if (!response.ok) {
        throw new Error('설정 업데이트에 실패했습니다.');
      }

      // 로컬 상태 업데이트
      setPreferences(prev =>
        prev.map(pref =>
          pref.boardId === boardId
            ? {...pref, enabled, hasPreference: true}
            : pref
        )
      );

    } catch (err) {
      console.error('설정 업데이트 오류:', err);
      setError(err.message);
    } finally {
      setUpdating(prev => ({...prev, [boardId]: false}));
    }
  };

  useEffect(() => {
    if (session) {
      fetchPreferences();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">로그인이 필요합니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-goblin-dark mb-2">게시판 알림 설정</h3>
        <p className="text-gray-600 text-sm">
          각 게시판별로 푸시 알림 수신 여부를 설정할 수 있습니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {preferences.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">설정할 수 있는 게시판이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {preferences.map((pref) => (
            <div
              key={pref.boardId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-goblin-dark">{pref.boardName}</h4>
                {pref.boardDescription && (
                  <p className="text-sm text-gray-500 mt-1">{pref.boardDescription}</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {pref.enabled ? '알림 받음' : '알림 끔'}
                </span>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.enabled}
                    onChange={(e) => updatePreference(pref.boardId, e.target.checked)}
                    disabled={updating[pref.boardId]}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent">
                  </div>
                </label>

                {updating[pref.boardId] && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"/>
          </svg>
          <div>
            <p className="text-sm text-blue-700">
              <strong>알림 정보:</strong>
            </p>
            <ul className="text-sm text-blue-600 mt-1 space-y-1">
              <li>• 게시판에 새 글이 작성되면 알림을 받습니다</li>
              <li>• 전체 푸시 알림 설정이 꺼져 있으면 게시판 알림도 받을 수 없습니다</li>
              <li>• 설정 변경은 즉시 적용됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardNotificationSettings;