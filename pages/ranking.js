import {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import Link from "next/link";

export default function Ranking() {
  const [activeTab, setActiveTab] = useState('avgPrice');
  const {data: session, status} = useSession();
  const router = useRouter();

  // 랭킹 데이터 상태
  const [rankingData, setRankingData] = useState({
    productCount: [],
    lowestPrice: [],
    averagePrice: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 랭킹 데이터 가져오기
  useEffect(() => {
    const fetchRankingData = async () => {
      if (status === 'loading' || !session) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/rank');
        if (!response.ok) {
          throw new Error('랭킹 데이터를 가져올 수 없습니다.');
        }
        const data = await response.json();
        setRankingData(data);
      } catch (err) {
        console.error('랭킹 데이터 조회 오류:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [session, status]);

  const getRankBorderStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'border-l-4 border-accent';
      case 2:
        return 'border-l-4 border-goblin-light';
      case 3:
        return 'border-l-4 border-secondary';
      default:
        return 'border-l-4 border-transparent';
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const renderSiteRankingList = (rankingData, type) => {
    const isProductRanking = type === 'products';
    const progressGradient = isProductRanking ? 'from-primary to-goblin-light' : 'from-accent to-secondary';
    const percentageColor = isProductRanking ? 'from-primary to-goblin-dark' : 'from-accent to-secondary';
    const description = isProductRanking ? '상품 보유' : '최저가 제품';

    return (
      <div className="divide-y divide-gray-200">
        {rankingData.map((site) => (
          <div key={site.rank}
               className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 transition-colors duration-200 hover:bg-gray-50 ${getRankBorderStyle(site.rank)}`}>
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="text-2xl font-bold text-gray-500 w-12 text-center">{getRankIcon(site.rank)}</div>
              <div className="ml-4">
                <Link href={site.siteUrl}>
                  <div className="text-lg font-bold text-gray-800">{site.siteName}</div>
                </Link>
                <div className="text-sm text-gray-500">{description} <span className="font-semibold text-gray-700">{site.value.toLocaleString()}</span>개</div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pl-16 sm:pl-0">
              <div className="w-2/3 sm:w-40">
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>점유율</span><span>{site.percentage}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`bg-gradient-to-r ${progressGradient} h-2.5 rounded-full`} style={{width: `${site.percentage}%`}}></div>
                </div>
              </div>
              <div className={`text-3xl font-extrabold bg-gradient-to-r ${percentageColor} bg-clip-text text-transparent`}>{site.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAveragePriceRankingList = (rankingData) => (
    <div className="divide-y divide-gray-200">
      {rankingData.map((site) => (
        <div key={site.rank}
             className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 transition-colors duration-200 hover:bg-gray-50 ${getRankBorderStyle(site.rank)}`}>
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="text-2xl font-bold text-gray-500 w-12 text-center">{getRankIcon(site.rank)}</div>
            <div className="ml-4">
              <Link href={site.siteUrl}>
                <div className="text-lg font-bold text-gray-800">{site.siteName}</div>
              </Link>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary pl-16 sm:pl-0">{site.value.toLocaleString()}원</div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = (title, description, list) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{description}</p>
      </div>
      {list}
    </div>
  );

  const tabs = [
    {id: 'avgPrice', label: '📉 사이트별 평균 가격'},
    {id: 'products', label: '📊 사이트별 상품 보유 현황'},
    {id: 'prices', label: '💰 최저가 상품 개수'},
  ];

  // 로그인 필요 오버레이 컴포넌트
  const LoginRequiredOverlay = () => (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl flex items-center justify-center gap-3">
          <span className="text-5xl">🏆</span>사이트 랭킹
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" class="text-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-500 mb-6">랭킹 데이터를 보시려면 로그인을 해주세요.</p>

            <button
              onClick={() => router.push('/auth/signin?callbackUrl=/ranking')}
              className="bg-primary hover:bg-goblin-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 로딩 중일 때 표시할 컴포넌트
  if (status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 비로그인 상태일 때 로그인 필요 오버레이 표시
  if (!session) {
    return <LoginRequiredOverlay/>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl flex items-center justify-center gap-3">
          <span className="text-5xl">🏆</span>사이트 랭킹
        </h1>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap justify-center gap-2 bg-gray-200 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                activeTab === tab.id ? 'bg-white text-goblin-dark shadow-sm' : 'text-gray-500 hover:bg-gray-300/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">랭킹 데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">데이터 로딩 오류</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'products' && renderTabContent('판매 사이트별 상품 보유 현황', '등록된 전체 상품 중 각 사이트의 보유 비율', renderSiteRankingList(rankingData.productCount.length > 0 ? rankingData.productCount : [], 'products'))}
            {activeTab === 'prices' && renderTabContent('최저가 상품 개수', '동일 상품군에서 최저가를 제공한 횟수 기준', renderSiteRankingList(rankingData.lowestPrice.length > 0 ? rankingData.lowestPrice : [], 'prices'))}
            {activeTab === 'avgPrice' && renderTabContent('사이트별 상품 평균 가격', '사이트별 등록된 상품들의 평균 판매 가격 (낮은 순)', renderAveragePriceRankingList(rankingData.averagePrice.length > 0 ? rankingData.averagePrice : []))}
          </>
        )}
      </div>
    </div>
  );
}
