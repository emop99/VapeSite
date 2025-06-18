import {useRouter} from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Pagination from '../../../components/Pagination';

export default function BoardPage({board, posts, totalPages, currentPage}) {
  const router = useRouter();
  const {slug} = router.query;

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    router.push({
      pathname: `/community/board/${slug}`,
      query: {page: newPage},
    }).then();
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      {board && (
        <Head>
          <title>{board.name ? `${board.name} | 주스고블린 커뮤니티` : '주스고블린 커뮤니티'}</title>
          <meta name="description" content={board.description || `주스고블린 커뮤니티의 ${board.name} 게시판입니다.`}/>

          {/* Open Graph 태그 */}
          <meta property="og:title" content={board.name ? `${board.name} | 주스고블린 커뮤니티` : '주스고블린 커뮤니티'}/>
          <meta property="og:description" content={board.description || `주스고블린 커뮤니티의 ${board.name} 게시판입니다.`}/>
          <meta property="og:type" content="website"/>
          <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/community/board/${slug}`}/>
          <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}/>

          {/* Twitter 카드 */}
          <meta name="twitter:card" content="summary"/>
          <meta name="twitter:title" content={board.name ? `${board.name} | 주스고블린 커뮤니티` : '주스고블린 커뮤니티'}/>
          <meta name="twitter:description" content={board.description || `주스고블린 커뮤니티의 ${board.name} 게시판입니다.`}/>
          <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}/>

          <meta name="robots" content="index, follow"/>
          <meta name="language" content="Korean"/>
          <meta name="author" content="쥬스고블린"/>

          {/* 캐노니컬 URL */}
          <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/community/board/${slug}`}/>
        </Head>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {!board ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border-t-4 border-red-500 animate-fade-in">
            <p className="text-red-500 font-bold text-lg">게시판을 찾을 수 없습니다.</p>
            <Link href="/community" className="text-accent hover:underline mt-4 inline-block transition-all duration-200 hover:text-accent-dark">
              커뮤니티 메인으로 돌아가기
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-6 rounded-lg shadow-md border-l-4 border-accent">
              <div>
                <h1 className="text-3xl font-bold text-goblin-dark">{board.name}</h1>
                <p className="text-gray-600 mt-2">{board.description}</p>
              </div>
              <Link
                href={`/community/edit?boardId=${board.id}`}
                className="mt-4 sm:mt-0 bg-accent hover:bg-accent-dark text-white font-bold py-2 px-6 rounded-md transition-all duration-200 transform hover:scale-105 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                글쓰기
              </Link>
            </div>

            {posts.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        작성자
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        작성일
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        조회수
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr
                        key={post.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        onClick={() => router.push(`/community/post/${post.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {post.isNotice && (
                              <span className="bg-accent text-white text-xs font-semibold mr-2 px-2 py-1 rounded-full flex-shrink-0">
                                  공지
                                </span>
                            )}
                            <div className="text-goblin-dark font-medium hover:text-accent transition-colors duration-150">
                              {post.title}
                              {post.hasImage && (
                                <span className="ml-2" title="이미지 포함">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                  </svg>
                                </span>
                              )}
                              {post.commentCount > 0 && (
                                <span className="text-accent ml-2 text-sm">
                                  [{post.commentCount}]
                                </span>
                              )}
                              <div className="text-xs text-gray-500 mt-1 sm:hidden">
                                {post.User?.nickName || '알 수 없음'} • {formatDate(post.createdAt)} • 조회 {post.viewCount}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {post.User?.nickName || '알 수 없음'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {post.viewCount}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center border-t-4 border-accent animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
                <p className="text-gray-600">게시글이 없습니다. 첫 번째 글을 작성해보세요!</p>
                <Link
                  href={`/community/edit?boardId=${board.id}`}
                  className="mt-4 inline-block bg-accent hover:bg-accent-dark text-white font-bold py-2 px-6 rounded-md transition-all duration-200"
                >
                  첫 글 작성하기
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// 서버 사이드 렌더링을 위한 데이터 페칭
export async function getServerSideProps(context) {
  const {slug, page = 1, limit = 20} = context.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  try {
    // 게시판 정보 불러오기
    const boardResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/community/boards/${slug}?page=${pageNumber}&limit=${limitNumber}`);

    if (!boardResponse.ok) {
      // 게시판이 없는 경우
      return {
        props: {
          board: null,
          posts: [],
          totalPages: 0,
          currentPage: pageNumber
        }
      };
    }

    const boardData = await boardResponse.json();
    const {board, posts, totalPages, currentPage} = boardData;

    return {
      props: {
        board,
        posts,
        totalPages,
        currentPage,
      }
    };
  } catch (error) {
    console.error('게시판 데이터 조회 중 오류 발생:', error);
    return {
      props: {
        board: null,
        posts: [],
        totalPages: 0,
        currentPage: pageNumber
      }
    };
  }
}
