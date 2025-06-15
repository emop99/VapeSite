import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {FaArrowDown, FaArrowUp, FaEdit, FaHeart, FaRegHeart} from 'react-icons/fa';
import Image from 'next/image';
import {normalizeImageUrl} from '../../utils/helper';
import ReviewForm from '../../components/ReviewForm';
import SimilarProducts from '../../components/SimilarProducts';
import {useSession} from 'next-auth/react';
import toast from 'react-hot-toast';
import {renderStarRating} from '../../utils/renderStarRating';
import Pagination from '../../components/Pagination'; // Pagination 컴포넌트 import

// 리뷰가 현재 로그인한 사용자의 것인지 확인하는 함수
function isUsersReview(review, session) {
  if (!session?.user) return false;
  return (
    (review.User && review.User.email === session.user.email) ||
    (review.userId === session.user.id) ||
    (review.nickName === session.user.name)
  );
}

// 리뷰 작성자 이름 반환 함수
function getReviewerName(review) {
  return review.nickName || (review.User ? review.User.nickName : '익명');
}

// 제품 상세 페이지
export default function ProductDetail({productData, error: serverError}) {
  const router = useRouter();
  const {data: session} = useSession();

  // 제품 상태
  const [product, setProduct] = useState(productData || null);
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
  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  // 수정할 리뷰 상태
  const [editingReview, setEditingReview] = useState(null);
  // 현재 사용자의 리뷰
  const [userReview, setUserReview] = useState(null);
  // 찜 상태 추가
  const [isWished, setIsWished] = useState(productData?.isWished || false);
  // 찜하기 로딩 상태
  const [wishLoading, setWishLoading] = useState(false);

  // 페이지네이션 상태
  const REVIEWS_PER_PAGE = 5;
  const [currentReviewPage, setCurrentReviewPage] = useState(1);

  // 페이지네이션에 따른 리뷰 슬라이스
  const paginatedReviews = reviews.slice(
    (currentReviewPage - 1) * REVIEWS_PER_PAGE,
    currentReviewPage * REVIEWS_PER_PAGE
  );
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  // 상품 데이터 변경 감지 및 데이터 로드
  useEffect(() => {
    setProduct(productData);
    setPriceComparisons(productData.priceComparisons || []);
    setPriceHistory(productData.priceHistory || []);
    setReviews(productData.reviews || []);
    setAverageRating(productData.averageRating || 0);
    setIsEditing(false);
    setEditingReview(null);
    setUserReview(null);
    setIsWished(productData.isWished || false);
  }, [productData]);

  // 찜하기/취소 토글 함수
  const toggleWish = async () => {
    if (!session) {
      // 로그인하지 않은 사용자는 로그인 페이지로 이동
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(router.asPath));
      return;
    }

    setWishLoading(true);
    try {
      if (isWished) {
        // 찜 취소
        const response = await fetch(`/api/wishlist/${product.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const data = await response.json();
          setIsWished(data.isWished);
          toast.success('찜 목록에서 삭제되었습니다.'); // 성공 메시지 추가
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || '찜 취소에 실패했습니다.'); // 오류 메시지 추가
        }
      } else {
        // 찜하기
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({productId: product.id}),
        });

        if (response.ok) {
          const data = await response.json();
          setIsWished(data.isWished);
          toast.success('찜 목록에 추가되었습니다.'); // 성공 메시지 추가
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || '찜하기에 실패했습니다.'); // 오류 메시지 추가
        }
      }
    } catch (error) {
      console.error('찜하기 오류:', error);
      toast.error('찜하기 처리 중 오류가 발생했습니다.'); // 오류 메시지 추가
    } finally {
      setWishLoading(false);
    }
  };

  // 사용자의 리뷰가 있는지 확인
  useEffect(() => {
    if (session?.user?.email && reviews.length > 0) {
      // 로그인한 사용자의 리뷰 찾기
      const foundReview = reviews.find(review => isUsersReview(review, session));
      if (foundReview) {
        setUserReview(foundReview);
      }
    }
  }, [session, reviews]);

  // 리뷰 수정 핸들러
  const handleEditReview = (review) => {
    if (!isUsersReview(review, session)) {
      alert('자신이 작성한 리뷰만 수정할 수 있습니다.');
      return;
    }
    setEditingReview(review);
    setIsEditing(true);
    const reviewFormElement = document.getElementById('review-form-section');
    if (reviewFormElement) {
      reviewFormElement.scrollIntoView({behavior: 'smooth'});
    }
  };

  // 리뷰 페이지 변경 핸들러
  const handleReviewPageChange = (page) => {
    setCurrentReviewPage(page);
    // 페이지 이동 시 스크롤 위치 조정 (선택)
    const reviewSection = document.getElementById('review-section');
    if (reviewSection) {
      reviewSection.scrollIntoView({behavior: 'smooth'});
    }
  };

  // 제품이 없을 때
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-3">제품을 찾을 수 없습니다</h2>
            <p className="text-gray-500 mb-9">요청하신 제품이 존재하지 않거나 삭제되었을 수 있습니다.</p>
            <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition-colors duration-300">
              메인 페이지로 돌아가기
            </Link>
          </div>
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

  // 제품 설명 생성 (SEO용)
  const productDescription = `${product.visibleName} - ${product.Company.name} - 최저가 ${product.priceComparisons[0].price.toLocaleString()}원. ${reviews.length > 0 ? `평점 ${averageRating.toFixed(1)}/5 (${reviews.length}개의 리뷰)` : ''}`;

  // 제품 이미지 URL (SEO용)
  const productImageUrl = product.imageUrl ? normalizeImageUrl(product.imageUrl) : `${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 제품 SEO 메타 태그 */}
      <Head>
        <title>{`${product.visibleName} - ${product.Company.name} | 쥬스고블린 전자담배 액상 최저가 비교 가격 변동`}</title>
        <meta name="description" content={productDescription}/>
        <meta name="keywords"
              content={`${product.visibleName}, ${product.Company.name}, 쥬스고블린, 베이핑, 전자담배, 입호흡, 폐호흡, 액상, 액상최저가, 최저가, 최저가검색, 액상 추천, 액상추천, 전자담배 추천, 전자담배추천, 가격비교, 액상가격비교, 액상 가격비교, 최저가 찾기, 최저가찾기`}/>

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product"/>
        <meta property="og:title" content={`${product.visibleName} - ${product.Company.name} | 쥬스고블린 전자담배 액상 최저가 비교 가격 변동`}/>
        <meta property="og:description" content={productDescription}/>
        <meta property="og:image" content={productImageUrl}/>
        <meta property="og:site_name" content="쥬스고블린 전자담배 액상 최저가 비교 가격 변동"/>
        <meta property="product:price:amount" content={product.priceComparisons[0].price.toString()}/>
        <meta property="product:price:currency" content="KRW"/>
        <meta property="product:brand" content={product.Company.name}/>

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image"/>
        <meta property="twitter:title" content={`${product.visibleName} - ${product.Company.name} | 쥬스고블린 전자담배 액상 최저가 비교 가격 변동`}/>
        <meta property="twitter:description" content={productDescription}/>
        <meta property="twitter:image" content={productImageUrl}/>

        {/* 구조화된 데이터 (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.visibleName,
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
                seller: {
                  '@type': 'Organization',
                  name: product.priceComparisons[0].SellerSite.name
                },
                priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 현재 날짜로부터 30일 후
              },
              ...(reviews.length > 0 ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: Math.max(1, averageRating).toFixed(1),
                  reviewCount: Math.max(1, reviews.length),
                  bestRating: 5,
                  worstRating: 1,
                },
                review: reviews.map(review => ({
                  '@type': 'Review',
                  reviewRating: {
                    '@type': 'Rating',
                    ratingValue: Math.max(1, review.rating),
                    bestRating: 5,
                    worstRating: 1
                  },
                  author: {
                    '@type': 'Person',
                    name: review.User ? review.User.nickName : '익명'
                  },
                  datePublished: review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  reviewBody: review.content || ''
                })),
              } : {}),
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
                alt={product.visibleName}
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
            <h1 className="text-3xl font-bold text-text mb-2">{product.visibleName}</h1>
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

            <div className="flex space-x-3 mb-4">
              {product.priceComparisons[0].sellerUrl && (
                <a
                  href={product.priceComparisons[0].sellerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 text-center"
                >
                  최저가로 구매하러 가기
                </a>
              )}

              {/* 찜하기 버튼 추가 */}
              <button
                onClick={toggleWish}
                disabled={wishLoading}
                className={`flex items-center justify-center px-4 py-2 rounded transition-colors duration-200 ${
                  isWished
                    ? 'bg-pink-100 text-pink-500 hover:bg-pink-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                aria-label={isWished ? '찜 취소하기' : '찜하기'}
              >
                {isWished ? <FaHeart className="text-xl"/> : <FaRegHeart className="text-xl"/>}
              </button>
            </div>
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
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">링크</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {priceComparisons.map((comparison, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comparison.SellerSite.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-price">
                    {comparison.price.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <a
                      href={comparison.sellerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded transition-colors duration-200 whitespace-nowrap"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                      </svg>
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
                          <FaArrowDown className="text-green-500 mr-1"/>
                          <span className="text-green-500 font-medium">
                              {Math.abs(history.priceDifference).toLocaleString()}원 ({Math.abs(history.percentageChange).toFixed(1)}%)
                            </span>
                        </>
                      ) : history.priceDifference > 0 ? (
                        <>
                          <FaArrowUp className="text-red-500 mr-1"/>
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

      {/* 연관 상품 레이아웃 - 개선된 UI/UX 디자인 */}
      {productData?.similarProducts && Object.keys(productData.similarProducts).length > 0 && (
        <SimilarProducts products={productData.similarProducts}/>
      )}

      {/* 유저 리뷰 레이아웃 */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8" id="review-section">
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

            {/* 개별 리뷰 (페이지네이션 적용) */}
            {paginatedReviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg break-words">{review.title}</p>
                    <div className="flex items-center mt-1 mb-2">
                      {renderStarRating(review.rating)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  작성자: {getReviewerName(review)}
                </p>

                <p className="text-gray-700 mb-4 break-words whitespace-pre-wrap">{review.content}</p>

                <div className="flex flex-col space-y-4 mb-4">
                  {review.pros && (
                    <div>
                      <p className="font-semibold text-green-600 mb-1">장점</p>
                      <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">{review.pros}</p>
                    </div>
                  )}

                  {review.cons && (
                    <div>
                      <p className="font-semibold text-red-600 mb-1">단점</p>
                      <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">{review.cons}</p>
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

                  {/* 리뷰 수정 버튼 (로그인한 사용자에게만 표시) */}
                  {session?.user && isUsersReview(review, session) && (
                    <button
                      onClick={() => handleEditReview(review)}
                      className="text-sm text-gray-500 flex items-center"
                    >
                      <FaEdit className="mr-1"/>
                      <span>수정하기</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 페이지네이션 UI */}
            {totalReviewPages > 1 && (
              <Pagination
                page={currentReviewPage}
                totalPages={totalReviewPages}
                onPageChange={handleReviewPageChange}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">아직 리뷰가 없습니다.</p>
            <p className="text-gray-500 mt-2">첫 번째 리뷰를 작성해보세요!</p>
          </div>
        )}

        {/* 리뷰 작성 폼 */}
        <div className="mt-8" id="review-form-section">
          <h3 className="text-xl font-bold mb-4">{isEditing ? '리뷰 수정하기' : '리뷰 작성하기'}</h3>

          {/* 일반 모드: 사용자 리뷰가 없거나 수정 모드일 때만 폼 표시 */}
          {(!userReview || isEditing) ? (
            <ReviewForm
              productId={product.id}
              existingReview={isEditing ? editingReview : null}
              onReviewSubmit={(newReview, isEdit) => {
                if (isEdit) {
                  // 수정인 경우: 기존 리뷰 업데이트
                  const updatedReviews = reviews.map(rev =>
                    rev.id === newReview.id ? newReview : rev
                  );
                  setReviews(updatedReviews);

                  // 평균 평점 다시 계산
                  const totalRating = updatedReviews.reduce((sum, rev) => sum + rev.rating, 0);
                  setAverageRating(totalRating / updatedReviews.length);

                  // 수정 모드 종료
                  setIsEditing(false);
                  setEditingReview(null);
                } else {
                  // 새 리뷰 생성인 경우
                  setReviews([...reviews, newReview]);
                  setAverageRating(((averageRating * reviews.length) + newReview.rating) / (reviews.length + 1));
                  setUserReview(newReview); // 작성한 리뷰 저장
                }
              }}
              onCancel={() => {
                setIsEditing(false);
                setEditingReview(null);
              }}
            />
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-2">이미 작성한 리뷰가 있습니다.</p>
              <div className="flex flex-col space-y-4">
                <div>
                  <p className="font-semibold">제목</p>
                  <p className="text-gray-700 break-words">{userReview.title}</p>
                </div>
                <div>
                  <p className="font-semibold">내용</p>
                  <p className="text-gray-700 break-words whitespace-pre-wrap">{userReview.content}</p>
                </div>
                <div>
                  <p className="font-semibold">평점</p>
                  <div className="flex items-center">
                    {renderStarRating(userReview.rating)}
                  </div>
                </div>
                {userReview.pros && (
                  <div>
                    <p className="font-semibold">장점</p>
                    <p className="text-gray-700 break-words whitespace-pre-wrap">{userReview.pros}</p>
                  </div>
                )}
                {userReview.cons && (
                  <div>
                    <p className="font-semibold">단점</p>
                    <p className="text-gray-700 break-words whitespace-pre-wrap">{userReview.cons}</p>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingReview(userReview);
                    }}
                    className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors flex-1"
                  >
                    리뷰 수정하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// 서버 사이드에서 제품 데이터 가져오기
export async function getServerSideProps(context) {
  const {id} = context.params;

  try {
    // API 호출을 위한 요청 옵션 설정
    const requestOptions = {
      headers: {}
    };

    // 로그인 상태인 경우 쿠키 추가
    if (context.req.headers.cookie) {
      requestOptions.headers['Cookie'] = context.req.headers.cookie;
    }

    // 서버에서 API 직접 호출 (인증 토큰 포함)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, requestOptions);

    if (!response.ok) {
      let errorMessage = '제품을 불러오는데 문제가 발생했습니다.';
      if (response.status === 400) {
        const data = await response.json();
        if (data.error) {
          errorMessage = data.error;
        }
      } else if (response.status >= 500) {
        errorMessage = '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (response.status === 404) {
        errorMessage = '해당 제품을 찾을 수 없습니다.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = '접근 권한이 없습니다. 로그인 후 다시 시도해주세요.';
      }
      return {
        props: {
          productData: null,
          error: errorMessage
        }
      };
    }

    const productData = await response.json();

    // 세션 정보를 props로 전달 (클라이언트에서 사용 가능)
    return {
      props: {
        productData,
        error: null
      }
    };
  } catch (err) {
    let errorMessage = '제품을 불러오는데 문제가 발생했습니다.';
    if (err.name === 'FetchError' || err.code === 'ECONNREFUSED') {
      errorMessage = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
    } else if (err.message && err.message.includes('NetworkError')) {
      errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
    }
    console.error('제품 로딩 오류:', err);
    return {
      props: {
        productData: null,
        error: errorMessage
      }
    };
  }
}