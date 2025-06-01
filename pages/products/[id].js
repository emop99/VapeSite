import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import Image from 'next/image';
import {normalizeImageUrl} from '../../utils/helper';

// 제품 상세 페이지
export default function ProductDetail({ productData, error: serverError }) {
  // 별점 렌더링 헬퍼 함수
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // 꽉 찬 별
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    // 반 별
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
    }

    // 빈 별
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-star-${i}`} className="text-yellow-400" />);
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };
  const router = useRouter();

  // 제품 상태
  const [product, setProduct] = useState(productData || null);
  // 로딩 상태
  const [loading, setLoading] = useState(!productData);
  // 에러 상태
  const [error, setError] = useState(serverError || null);
  // 가격 비교 상태
  const [priceComparisons, setPriceComparisons] = useState(productData?.priceComparisons || []);
  // 가격 변동 이력 상태
  const [priceHistory, setPriceHistory] = useState(productData?.priceHistory || []);
  // 리뷰 상태
  const [reviews, setReviews] = useState(productData?.reviews || []);
  // 평균 평점
  const [averageRating, setAverageRating] = useState(productData?.averageRating || 0);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse text-primary text-lg">제품 정보를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 표시
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <Link href="/" className="text-primary mt-4 inline-block">
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 제품이 없을 때
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-500 text-lg">제품을 찾을 수 없습니다.</p>
          <Link href="/" className="text-primary mt-4 inline-block">
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 제품 설명 생성 (SEO용)
  const productDescription = `${product.name} - ${product.Company.name} - 최저가 ${product.priceComparisons[0].price.toLocaleString()}원. ${reviews.length > 0 ? `평점 ${averageRating.toFixed(1)}/5 (${reviews.length}개의 리뷰)` : ''}`;

  // 제품 이미지 URL (SEO용)
  const productImageUrl = product.imageUrl ? normalizeImageUrl(product.imageUrl) : `${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 제품 SEO 메타 태그 */}
      <Head>
        <title>{`${product.name} - ${product.Company.name} | 쥬스고블린 전자담배 액상 최저가 비교 가격 변동`}</title>
        <meta name="description" content={productDescription} />
        <meta name="keywords" content={`${product.name}, ${product.Company.name}, 쥬스고블린, 베이핑, 전자담배, 입호흡, 폐호흡, 액상, 액상최저가, 최저가, 최저가검색, 액상 추천, 액상추천, 전자담배 추천, 전자담배추천, 가격비교, 액상가격비교, 액상 가격비교, 최저가 찾기, 최저가찾기`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} - ${product.Company.name} | 쥬스고블린`} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:image" content={productImageUrl} />
        <meta property="og:site_name" content="쥬스고블린" />
        <meta property="product:price:amount" content={product.priceComparisons[0].price.toString()} />
        <meta property="product:price:currency" content="KRW" />
        <meta property="product:brand" content={product.Company.name} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={`${product.name} - ${product.Company.name} | 쥬스고블린`} />
        <meta property="twitter:description" content={productDescription} />
        <meta property="twitter:image" content={productImageUrl} />

        {/* 구조화된 데이터 (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.name,
              image: productImageUrl,
              description: productDescription,
              brand: {
                '@type': 'Brand',
                name: product.Company.name,
              },
              offers: {
                '@type': 'Offer',
                url: `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`,
                priceCurrency: 'KRW',
                price: product.priceComparisons[0].price,
                availability: 'https://schema.org/InStock',
              },
              ...(reviews.length > 0 && {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: averageRating.toFixed(1),
                  reviewCount: reviews.length,
                },
              }),
            })
          }}
        />
      </Head>

      {/* 제품 상세 정보 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          {/* 제품 이미지 */}
          <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
            {product.imageUrl ? (
              <Image
                src={normalizeImageUrl(product.imageUrl)}
                alt={product.name} 
                width={500}
                height={500}
                className="max-w-full max-h-96 object-contain"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-gray-400">
                이미지 없음
              </div>
            )}
          </div>

          {/* 제품 정보 */}
          <div className="md:w-1/2 p-8">
            <h1 className="text-3xl font-bold text-text mb-2">{product.name}</h1>
            <p className="text-lg text-gray-600 mb-2">{product.Company.name}</p>

            {/* 평균 평점 표시 */}
            {reviews.length > 0 && (
              <div className="mb-4">
                {renderStarRating(averageRating)}
                <p className="text-sm text-gray-500 mt-1">총 {reviews.length}개의 리뷰</p>
              </div>
            )}

            <div className="flex space-x-2 mb-4">
              {product.nicotine && (
                <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-600">
                  {product.nicotine}mg
                </span>
              )}
            </div>

            <p className="text-2xl font-bold mb-4 text-price">{product.priceComparisons[0].price.toLocaleString()}원</p>

            {product.priceComparisons[0].sellerUrl && (
              <a
                href={product.priceComparisons[0].sellerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center"
              >
                최저가로 구매하러 가기
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 가격 비교 레이아웃 */}
      {priceComparisons.length > 0 && (
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">가격 비교</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">판매처</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최종 가격</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">링크</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceComparisons.map((comparison, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comparison.SellerSite.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comparison.price.toLocaleString()}원</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-price">
                      {comparison.price.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a
                        href={comparison.sellerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark"
                      >
                        구매하기
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 최근 가격 변동 레이아웃 */}
      {priceHistory.length > 1 && (
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">최근 가격 변동</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이전 가격</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">새 가격</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">변동</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {priceHistory.filter(history => history.oldPrice > 0).map((history, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(history.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {history.oldPrice.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {history.newPrice.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {history.priceDifference < 0 ? (
                          <>
                            <FaArrowDown className="text-green-500 mr-1" />
                            <span className="text-green-500 font-medium">
                              {Math.abs(history.priceDifference).toLocaleString()}원 ({Math.abs(history.percentageChange).toFixed(1)}%)
                            </span>
                          </>
                        ) : history.priceDifference > 0 ? (
                          <>
                            <FaArrowUp className="text-red-500 mr-1" />
                            <span className="text-red-500 font-medium">
                              {history.priceDifference.toLocaleString()}원 ({history.percentageChange.toFixed(1)}%)
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">변동 없음</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 유저 리뷰 레이아웃 */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">사용자 리뷰</h2>

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {/* 평균 평점 요약 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
              <div>
                <p className="text-lg font-bold">평균 평점</p>
                <div className="flex items-center mt-1">
                  {renderStarRating(averageRating)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{reviews.length}개의 리뷰</p>
                <p className="text-sm text-gray-500">
                  {reviews.filter(r => r.recommended).length}명이 이 제품을 추천합니다
                </p>
              </div>
            </div>

            {/* 개별 리뷰 */}
            {reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{review.title}</p>
                    <div className="flex items-center mt-1 mb-2">
                      {renderStarRating(review.rating)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-2">작성자: {review.userName}</p>

                {review.usagePeriod && (
                  <p className="text-sm text-gray-500 mb-2">사용 기간: {review.usagePeriod}</p>
                )}

                <p className="text-gray-700 mb-4">{review.content}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {review.pros && (
                    <div>
                      <p className="font-semibold text-green-600 mb-1">장점</p>
                      <p className="text-sm text-gray-700">{review.pros}</p>
                    </div>
                  )}

                  {review.cons && (
                    <div>
                      <p className="font-semibold text-red-600 mb-1">단점</p>
                      <p className="text-sm text-gray-700">{review.cons}</p>
                    </div>
                  )}
                </div>

                {/* 리뷰 이미지가 있는 경우 */}
                {review.imageUrls && review.imageUrls.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">리뷰 이미지</p>
                    <div className="flex space-x-2 overflow-x-auto">
                      {review.imageUrls.map((url, imgIndex) => (
                        <Image
                          key={imgIndex}
                          src={url}
                          alt={`리뷰 이미지 ${imgIndex + 1}`}
                          width={96}
                          height={96}
                          className="w-24 h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {review.recommended ? (
                      <span className="text-green-600 text-sm font-medium">이 제품을 추천합니다</span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium">이 제품을 추천하지 않습니다</span>
                    )}
                  </div>

                  <button className="text-sm text-gray-500 flex items-center">
                    <span className="mr-1">도움이 됐어요</span>
                    <span className="font-medium">{review.helpfulCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 리뷰가 없습니다.</p>
            <p className="text-gray-500 mt-2">첫 번째 리뷰를 작성해보세요!</p>
          </div>
        )}
      </section>
    </div>
  );
}

// 서버 사이드에서 제품 데이터 가져오기
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    // 서버에서 API 직접 호출
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products/${id}`);

    if (!response.ok) {
      if (response.status === 400) {
        const data = await response.json();
        if (data.error) {
          return {
            props: {
              productData: null,
              error: data.error
            }
          };
        }
      }
      return {
        props: {
          productData: null,
          error: '제품을 불러오는데 문제가 발생했습니다.'
        }
      };
    }

    const productData = await response.json();

    return {
      props: {
        productData,
        error: null
      }
    };
  } catch (err) {
    console.error('제품 로딩 오류:', err);
    return {
      props: {
        productData: null,
        error: '제품을 불러오는데 문제가 발생했습니다.'
      }
    };
  }
}
