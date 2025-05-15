// 판매 사이트 정보 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

// 판매 사이트 모델 정의
const SellerSite = sequelize.define('SellerSite', {
  // 판매 사이트 ID (기본 키)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 사이트 URL
  siteUrl: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // 사이트 이름
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_seller_site',
  // 타임스탬프 설정
  timestamps: true,
});

module.exports = SellerSite;