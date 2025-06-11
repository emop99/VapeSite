import {FaRegStar, FaStar, FaStarHalfAlt} from 'react-icons/fa';
import React from 'react';

// 별점 렌더링 함수
export function renderStarRating(rating) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // 꽉 찬 별
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`star-${i}`} className="text-yellow-400"/>);
  }

  // 반 별
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400"/>);
  }

  // 빈 별
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-star-${i}`} className="text-yellow-400"/>);
  }

  return (
    <div className="flex items-center">
      {stars}
      <span className="ml-1 text-gray-600">({rating.toFixed(1)})</span>
    </div>
  );
}
