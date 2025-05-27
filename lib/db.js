// 데이터베이스 연결 설정
const { Sequelize } = require('sequelize');

// 환경 변수에서 데이터베이스 연결 정보 가져오기
// .env 또는 .env.development 파일에서 로드됨
const databaseUrl = process.env.DATABASE_URL;

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

module.exports = {
  sequelize,
};
