import React from 'react';

/**
 * GNB 또는 다른 요소에 부착할 수 있는 레드닷(알림 표시) 컴포넌트
 * 부모 요소가 'relative' 클래스를 가지고 있어야 합니다.
 */
const RedDot = ({ color = 'bg-red-500', pingColor = 'bg-red-400', size = 'h-2.5 w-2.5', animate = true, top = '-top-0.5', right = '-right-1' }) => {
  return (
    <span className={`absolute ${top} ${right} flex ${size}`}>
      {animate && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}></span>
      )}
      <span className={`relative inline-flex rounded-full ${size} ${color}`}></span>
    </span>
  );
};

export default RedDot;
