import Link from 'next/link';
import Image from 'next/image';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Autoplay, Navigation, Pagination} from 'swiper/modules';
import {normalizeImageUrl} from '../utils/helper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * 유사 상품을 표시하는 컴포넌트
 *
 * @param {Object} props
 * @param {Object} props.products - 표시할 유사 상품 객체
 * @param {string} props.title - 섹션 제목 (기본값: '이 제품과 비슷한 상품')
 * @param {string} props.subtitle - 부제목
 * @param {string} props.className - 추가 CSS 클래스 이름
 */
const SimilarProducts = ({
                           products,
                           title = '이 제품과 비슷한 상품',
                           subtitle = '',
                           className = '',
                         }) => {
  // 제품이 없거나 빈 객체인 경우 아무것도 렌더링하지 않음
  if (!products || Object.keys(products).length === 0) {
    return null;
  }

  const productItems = Object.values(products);

  return (
    <section className={`bg-white rounded-lg shadow-md mb-8 overflow-hidden ${className}`}>
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-bold mb-1">{title}</h2>
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>

      <div className="p-6 pt-2">
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{
              el: '.swiper-pagination-custom',
              clickable: true,
              renderBullet: function (index, className) {
                return `<span class="${className} w-2 h-2 bg-gray-300 hover:bg-primary"></span>`;
              }
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            loop={productItems.length > 3}
            breakpoints={{
              640: {slidesPerView: 2, spaceBetween: 16},
              768: {slidesPerView: 3, spaceBetween: 20},
              1024: {slidesPerView: 4, spaceBetween: 24},
            }}
            className="pb-12"
          >
            {productItems.map((product, index) => (
              <SwiperSlide key={index}>
                <div
                  className="group bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
                  <Link href={`/products/${product.id}`} className="block h-full flex flex-col">
                    <div className="relative pt-[75%] bg-gray-50 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={normalizeImageUrl(product.imageUrl)}
                          alt={product.visibleName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          className="object-contain absolute inset-0 p-4 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <span className="text-sm">이미지 없음</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-medium text-text text-sm md:text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {product.visibleName}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 mb-2">
                          {product.companyName}
                        </p>
                      </div>
                      <div className="mt-auto">
                        <p className="font-bold text-price text-base md:text-lg">
                          {product.min_price?.toLocaleString() || 'N/A'}원
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 커스텀 네비게이션 버튼 */}
          <button
            className="swiper-button-prev-custom absolute top-1/2 left-0 z-10 -translate-y-1/2 -translate-x-1 w-10 h-10 flex items-center justify-center bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full shadow hover:shadow-md transition-all duration-200 focus:outline-none">
            <span className="sr-only">이전</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
            </svg>
          </button>
          <button
            className="swiper-button-next-custom absolute top-1/2 right-0 z-10 -translate-y-1/2 translate-x-1 w-10 h-10 flex items-center justify-center bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full shadow hover:shadow-md transition-all duration-200 focus:outline-none">
            <span className="sr-only">다음</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts;
