// 데이터베이스 연결 설정
const { Sequelize } = require('sequelize');

// 환경 변수에서 데이터베이스 연결 정보 가져오기
const databaseUrl = process.env.DATABASE_URL || 'mysql://vapeuser:vapepassword@localhost:3306/vapesite';

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  dialectOptions: {
    // MariaDB 관련 옵션
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5, // 최대 연결 수
    min: 0, // 최소 연결 수
    acquire: 30000, // 연결 획득 제한 시간 (ms)
    idle: 10000, // 유휴 연결 제한 시간 (ms)
  },
});

// 데이터베이스 연결 테스트 함수
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공!');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
};