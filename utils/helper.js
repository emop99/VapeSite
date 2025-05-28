/**
 * URL이 '//'로 시작하는 경우(프로토콜 상대 URL), 'https:'를 URL 앞에 추가합니다.
 *
 * @param {string} url - 표준화할 이미지 URL
 * @returns {string} 표준화된 URL 또는 입력값이 falsy한 경우 빈 문자열
 */
const normalizeImageUrl = (url) => {
  if (!url) return '';
  return url.startsWith('//') ? `https:${url}` : url;
}

module.exports = {
  normalizeImageUrl,
};