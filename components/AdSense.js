import {useEffect, useRef} from 'react';

// 공용 Google AdSense 광고 슬롯 컴포넌트
// 사용 예시:
// <AdSense slot="9700648621" style={{display:'block'}} />
// <AdSense slot="9833167103" format="auto" responsive />
export default function AdSense({
  client,
  slot,
  format = 'auto',
  responsive = true,
  layout,
  layoutKey,
  className = '',
  style = {display: 'block'},
  id,
}) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const resizeObserverRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    // ref 스냅샷을 캡처해서 cleanup 시점에 변경된 ref를 참조하지 않도록 함
    const el = insRef.current;
    const doPush = () => {
      if (pushedRef.current) return;
      try {
        // eslint-disable-next-line no-undef
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      } catch (_) {
        // 스크립트 로드 지연 가능성: 잠시 후 재시도 (단, 중복 방지)
        const t = setTimeout(() => {
          if (!pushedRef.current) {
            try {
              // eslint-disable-next-line no-undef
              (window.adsbygoogle = window.adsbygoogle || []).push({});
              pushedRef.current = true;
            } catch (__) {
              // 마지막 재시도 실패 시에는 조용히 무시 (다음 화면 전환에서 재시도될 수 있음)
            }
          }
        }, 1000);
        timersRef.current.push(t);
      }
    };

    const tryWhenWidthReady = () => {
      // 캡처된 el 기준으로 처리
      // ResizeObserver로 폭이 0에서 >0이 되는 시점을 대기
      try {
        if (typeof ResizeObserver !== 'undefined') {
          const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const target = entry.target;
              const width = (entry.contentRect && entry.contentRect.width) || target.clientWidth || 0;
              if (width > 0) {
                ro.disconnect();
                doPush();
                break;
              }
            }
          });
          if (el) ro.observe(el);
          resizeObserverRef.current = ro;
        } else {
          // 폴백: 간단한 폴링 (최대 5초)
          const started = Date.now();
          const poll = () => {
            if (!el) return;
            if (el.clientWidth > 0) {
              doPush();
              return;
            }
            if (Date.now() - started < 5000) {
              const t = setTimeout(poll, 200);
              timersRef.current.push(t);
            }
          };
          poll();
        }
      } catch (_) {
        // observer 등록 실패 시, 약간 지연 후 최종 시도
        const t = setTimeout(doPush, 800);
        timersRef.current.push(t);
      }
    };

    // DOM에 ins가 준비된 뒤, 가용 폭이 준비되면 트리거
    if (el) {
      tryWhenWidthReady();
    } else {
      // 아주 드문 경우를 대비한 소폭 지연 후 재확인
      const t = setTimeout(() => tryWhenWidthReady(), 300);
      timersRef.current.push(t);
    }

    // window load 시점에 아직 push가 안되었다면 최종 확인
    const onLoad = () => {
      if (!pushedRef.current) tryWhenWidthReady();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('load', onLoad);
    }

    // 언마운트 시 광고 DOM 정리 (다음 마운트에서 새로 그림)
    return () => {
      if (el) {
        el.innerHTML = '';
      }
      pushedRef.current = false;
      if (resizeObserverRef.current) {
        try { resizeObserverRef.current.disconnect(); } catch (_) {}
        resizeObserverRef.current = null;
      }
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', onLoad);
      }
    };
  }, [client, slot]);

  // 필수 속성 안전장치
  if (!slot) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('AdSense: data-ad-slot 값이 필요합니다.');
    }
  }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`.trim()}
      style={style}
      data-ad-client={client || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-4259248617155600'}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
      {...(layout ? {['data-ad-layout']: layout} : {})}
      {...(layoutKey ? {['data-ad-layout-key']: layoutKey} : {})}
      {...(process.env.NODE_ENV !== 'production' ? {['data-adtest']: true} : {})}
      {...(id ? {id} : {})}
      aria-label="adsense-ad-slot"
    />
  );
}
