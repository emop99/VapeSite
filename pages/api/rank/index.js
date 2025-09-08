// 랭킹 API 라우트
import {sequelize} from '../../../lib/db';
import {getSession} from 'next-auth/react';

/**
 * 랭킹 API 핸들러
 * GET: 랭킹 데이터 조회 (사이트별 상품 보유 현황, 최저가 상품 개수, 사이트별 평균 가격)
 */
export default async function handler(req, res) {
  // HTTP 메소드 확인
  if (req.method !== 'GET') {
    return res.status(405).json({error: '허용되지 않는 메소드입니다.'});
  }

  try {
    // 세션 확인 (로그인된 사용자만 접근 가능)
    const session = await getSession({req});
    if (!session) {
      return res.status(401).json({error: '로그인이 필요합니다.'});
    }

    // 사이트별 상품 보유 현황 쿼리
    const [productCountRanking] = await sequelize.query(`
        SELECT sellerId, siteUrl, vape_seller_site.name, COUNT(*) as productCount
        FROM vapesite.vape_products
                 LEFT JOIN vapesite.vape_price_comparisons ON vape_products.id = vape_price_comparisons.productId
                 LEFT JOIN vapesite.vape_seller_site ON vape_price_comparisons.sellerId = vape_seller_site.id
        WHERE sellerId IS NOT NULL
        GROUP BY sellerId
        ORDER BY productCount DESC;
    `);

    // 최저가 상품 개수 쿼리
    const [lowestPriceRanking] = await sequelize.query(`
        SELECT sellerId, siteUrl, name, COUNT(*) as productCount
        FROM (SELECT sellerId
              FROM vapesite.vape_price_comparisons vpc
              WHERE productId IN (SELECT productId
                                  FROM vapesite.vape_price_comparisons
                                  GROUP BY productId
                                  HAVING COUNT(*) >= 2)
              GROUP BY productId
              ORDER BY NULL) as t1
                 JOIN vapesite.vape_seller_site ON vape_seller_site.id = t1.sellerId
        GROUP BY sellerId
        ORDER BY productCount DESC;
    `);

    // 사이트별 평균 가격 쿼리
    const [averagePriceRanking] = await sequelize.query(`
        SELECT sellerId, siteUrl, name, FLOOR(AVG(price)) as avgPrice
        FROM vapesite.vape_seller_site
                 JOIN vapesite.vape_price_comparisons ON vapesite.vape_seller_site.id = vapesite.vape_price_comparisons.sellerId
        GROUP BY sellerId
        ORDER BY avgPrice;
    `);

    // 퍼센테이지 계산을 위한 총합 계산
    const calculatePercentages = (data, valueKey) => {
      const total = data.reduce((sum, item) => sum + parseInt(item[valueKey]), 0);
      return data.map((item, index) => ({
        rank: index + 1,
        siteName: item.name,
        siteUrl: item.siteUrl,
        value: parseInt(item[valueKey]),
        percentage: total > 0 ? parseFloat(((parseInt(item[valueKey]) / total) * 100).toFixed(1)) : 0
      }));
    };

    // 평균 가격 데이터 포맷팅 (퍼센테이지 없이)
    const formatAveragePriceData = (data) => {
      return data.map((item, index) => ({
        rank: index + 1,
        siteName: item.name,
        siteUrl: item.siteUrl,
        value: parseInt(item.avgPrice),
        productCount: parseInt(item.productCount) || 0
      }));
    };

    // 응답 데이터 구성
    const responseData = {
      productCount: calculatePercentages(productCountRanking, 'productCount'),
      lowestPrice: calculatePercentages(lowestPriceRanking, 'productCount'),
      averagePrice: formatAveragePriceData(averagePriceRanking),
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('랭킹 데이터 조회 오류:', error);
    return res.status(500).json({error: '랭킹 데이터 조회 중 오류가 발생했습니다.'});
  }
}