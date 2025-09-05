import {useState} from 'react';

export default function Ranking() {
  const [activeTab, setActiveTab] = useState('views');

  // Mock Data
  const productCountRanking = [
    {rank: 1, siteName: 'VapeShop A', value: 2847, percentage: 35.2},
    {rank: 2, siteName: 'E-liquid Store', value: 2156, percentage: 26.7},
    {rank: 3, siteName: 'Vape Mall', value: 1893, percentage: 23.4},
    {rank: 4, siteName: 'Cloud Nine', value: 945, percentage: 11.7},
    {rank: 5, siteName: 'Vapor Hub', value: 242, percentage: 3.0},
  ];

  const lowestPriceRanking = [
    {rank: 1, siteName: 'Discount Vape', value: 1547, percentage: 42.8},
    {rank: 2, siteName: 'Budget E-juice', value: 892, percentage: 24.7},
    {rank: 3, siteName: 'Cheap Liquid', value: 634, percentage: 17.5},
    {rank: 4, siteName: 'Value Vape', value: 378, percentage: 10.5},
    {rank: 5, siteName: 'Economy Store', value: 163, percentage: 4.5},
  ];

  const productViewRanking = [
    {rank: 1, name: '[GeekVape] Aegis Legend 2', value: 128345, imageUrl: '/images/mock/vape_thumb_1.jpg'},
    {rank: 2, name: '[Vaporesso] Luxe XR Max', value: 110293, imageUrl: '/images/mock/vape_thumb_2.jpg'},
    {rank: 3, name: '[Voopoo] Drag 4', value: 98456, imageUrl: '/images/mock/vape_thumb_3.jpg'},
    {rank: 4, name: '[Smok] RPM 5 Pro', value: 76123, imageUrl: '/images/mock/vape_thumb_4.jpg'},
    {rank: 5, name: '[Lost Vape] Thelema Solo', value: 65048, imageUrl: '/images/mock/vape_thumb_5.jpg'},
  ];

  const averagePriceRanking = [
    {rank: 1, siteName: 'Value Vape', value: 23500, productCount: 378},
    {rank: 2, siteName: 'Budget E-juice', value: 24200, productCount: 892},
    {rank: 3, siteName: 'Economy Store', value: 25100, productCount: 163},
    {rank: 4, siteName: 'VapeShop A', value: 28900, productCount: 2847},
    {rank: 5, siteName: 'E-liquid Store', value: 29500, productCount: 2156},
  ];

  const getRankBorderStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'border-l-4 border-yellow-400';
      case 2:
        return 'border-l-4 border-slate-400';
      case 3:
        return 'border-l-4 border-orange-400';
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
    const progressGradient = isProductRanking ? 'from-blue-500 to-purple-500' : 'from-green-500 to-emerald-500';
    const percentageColor = isProductRanking ? 'from-blue-600 to-purple-600' : 'from-green-600 to-emerald-600';
    const description = isProductRanking ? '상품 보유' : '최저가 제품';

    return (
      <div className="divide-y divide-gray-200">
        {rankingData.map((site) => (
          <div key={site.rank}
               className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 transition-colors duration-200 hover:bg-gray-50 ${getRankBorderStyle(site.rank)}`}>
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="text-2xl font-bold text-gray-500 w-12 text-center">{getRankIcon(site.rank)}</div>
              <div className="ml-4">
                <div className="text-lg font-bold text-gray-800">{site.siteName}</div>
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

  const renderProductViewRankingList = (rankingData) => (
    <div className="divide-y divide-gray-200">
      {rankingData.map((product) => (
        <div key={product.rank} className={`flex items-center p-6 transition-colors duration-200 hover:bg-gray-50 ${getRankBorderStyle(product.rank)}`}>
          <div className="text-2xl font-bold text-gray-500 w-12 text-center">{getRankIcon(product.rank)}</div>
          <div className="ml-4 flex-grow">
            <div className="text-lg font-bold text-gray-800">{product.name}</div>
          </div>
          <div className="flex items-center text-gray-700 ml-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"/>
            </svg>
            <span className="font-semibold text-lg">{product.value.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAveragePriceRankingList = (rankingData) => (
    <div className="divide-y divide-gray-200">
      {rankingData.map((site) => (
        <div key={site.rank}
             className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 transition-colors duration-200 hover:bg-gray-50 ${getRankBorderStyle(site.rank)}`}>
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="text-2xl font-bold text-gray-500 w-12 text-center">{getRankIcon(site.rank)}</div>
            <div className="ml-4">
              <div className="text-lg font-bold text-gray-800">{site.siteName}</div>
              <div className="text-sm text-gray-500">총 <span className="font-semibold text-gray-700">{site.productCount.toLocaleString()}</span>개 상품</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 pl-16 sm:pl-0">{site.value.toLocaleString()}원</div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = (title, description, list) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>
      {list}
    </div>
  );

  const tabs = [
    {id: 'views', label: '👀 상품 조회수 순위'},
    {id: 'products', label: '📊 사이트별 상품 보유 현황'},
    {id: 'prices', label: '💰 최저가 상품 개수'},
    {id: 'avgPrice', label: '📉 사이트별 평균 가격'},
  ];

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
                activeTab === tab.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-300/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'products' && renderTabContent('판매 사이트별 상품 보유 현황', '등록된 전체 상품 중 각 사이트의 보유 비율', renderSiteRankingList(productCountRanking, 'products'))}
        {activeTab === 'prices' && renderTabContent('최저가 상품 개수', '동일 상품군에서 최저가를 제공한 횟수 기준', renderSiteRankingList(lowestPriceRanking, 'prices'))}
        {activeTab === 'views' && renderTabContent('상품별 조회수 순위', '가장 많이 조회된 상품 순위', renderProductViewRankingList(productViewRanking))}
        {activeTab === 'avgPrice' && renderTabContent('사이트별 상품 평균 가격', '사이트별 등록된 상품들의 평균 판매 가격 (낮은 순)', renderAveragePriceRankingList(averagePriceRanking))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">ℹ️ 랭킹 안내</h3>
        <ul className="text-blue-700 space-y-2">
          <li className="pt-1"><span className="font-semibold">업데이트:</span> 일정 시간마다 자동으로 업데이트됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
