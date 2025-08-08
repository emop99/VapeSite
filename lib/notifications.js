// 알림 관련 유틸리티 함수

/**
 * 실시간 알림 전송 함수
 *
 * @param {number} userId - 알림을 받을 사용자 ID
 * @param {object} notification - 알림 객체
 * @returns {boolean} - 알림 전송 성공 여부
 */
export const sendRealTimeNotification = (userId, notification) => {
  // Socket.io가 설정되어 있고 global.sendNotification이 존재하는 경우에만 실행
  if (typeof global.sendNotification === 'function') {
    return global.sendNotification(userId, notification);
  }
  return false;
};