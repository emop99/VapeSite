import Link from 'next/link';

export default function CommunityIndex({boards}) {
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-6 rounded-lg shadow-md border-l-4 border-accent">
          <div>
            <h1 className="text-3xl font-bold text-goblin-dark">커뮤니티</h1>
            <p className="text-gray-600 mt-2">다양한 주제로 소통하는 공간입니다</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="text-sm text-gray-500">
              <span className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                게시판을 선택하여 글을 작성하고 소통해보세요
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <Link href={`/community/board/${board.slug}`} className="block">
                <div className="p-6 border-l-4 border-transparent group-hover:border-accent transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-goblin-dark mb-2 group-hover:text-accent transition-colors duration-200">{board.name}</h2>
                      <p className="text-gray-600">{board.description}</p>
                    </div>
                    <div className="text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                      {board.postCount || 0} 게시글
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {boards.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border-t-4 border-accent animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <p className="text-gray-600">아직 게시판이 없습니다.</p>
          </div>
        )}
      </div>
    </>
  );
}

// 서버 사이드 렌더링을 위한 데이터 페칭
export async function getServerSideProps() {
  try {
    // API를 통해 게시판 목록 조회
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/community/boards`);

    if (!response.ok) {
      throw new Error('게시판 목록을 불러오는데 실패했습니다.');
    }

    const data = await response.json();

    // 게시판이 없는 경우 처리
    if (!data.boards || data.boards.length === 0) {
      return {
        props: {
          boards: []
        }
      };
    }

    return {
      props: {
        boards: data.boards
      }
    };
  } catch (error) {
    console.error('게시판 목록 조회 중 오류 발생:', error);
    return {
      props: {
        boards: []
      }
    };
  }
}
