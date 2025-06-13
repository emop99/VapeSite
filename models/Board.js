// 커뮤니티 게시판 정보 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');

// 게시판 모델 정의
const Board = sequelize.define('Board', {
  // 기본 키 ID (auto increment)
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 게시판 이름
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // 게시판 설명
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // 게시판 슬러그 (URL 식별자)
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  // 게시판 활성화 여부
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  // 삭제 일시
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_board',
  // 타임스탬프 설정
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_board_isActive_index',
      fields: ['isActive'],
    },
  ],
});

module.exports = Board;