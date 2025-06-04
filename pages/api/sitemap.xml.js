import Product from '../../models/Product';

// 도메인 설정 (배포 환경에 맞게 수정 필요)
const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://juicegoblin.com';

const generateSiteMap = (staticPaths, productPaths) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 정적 페이지 -->
  ${staticPaths
    .map((path) => {
      return `
    <url>
      <loc>${DOMAIN}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>
  `;
    })
    .join('')}
  
  <!-- 제품 페이지 -->
  ${productPaths
    .map((product) => {
      return `
    <url>
      <loc>${DOMAIN}/products/${product.id}</loc>
      <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>
  `;
    })
    .join('')}
</urlset>`;
};

export default async function handler(req, res) {
  try {
    // 정적 경로 설정
    const staticPaths = [
      '/',
      '/products',
      '/lung-inhalation',
      '/mouth-inhalation',
      '/auth/signin',
      '/auth/signup',
    ];

    // DB에서 제품 정보 가져오기
    const products = await Product.findAll({
      where: {isShow: true},
      select: {
        id: true,
        updatedAt: true,
      },
    });

    // sitemap XML 생성
    const sitemap = generateSiteMap(staticPaths, products);

    // XML 헤더 설정 및 응답
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('사이트맵 생성 오류:', error);
    res.status(500).json({error: '사이트맵 생성 중 오류가 발생했습니다.'});
  }
}

