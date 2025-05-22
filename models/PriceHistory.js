// 가격 변동 이력 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');
const Product = require('./Product');
const SellerSite = require('./SellerSite');

// 가격 변동 이력 모델 정의
const PriceHistory = sequelize.define('PriceHistory', {
  // 제품 ID (외래 키, 복합 기본 키의 일부)
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Product,
      key: 'id',
    },
  },
  // 판매처 ID (외래 키, 복합 기본 키의 일부)
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: SellerSite,
      key: 'id',
    },
  },
  // 새 가격 (복합 기본 키의 일부)
  newPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  // 이전 가격
  oldPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 가격 차
  priceDifference: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  // 백분율 변화 정보
  percentageChange: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_price_history',
  // 타임스탬프 설정
  createdAt: 'createdAt',
  updatedAt: false,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_price_history_createdAt_index',
      fields: ['createdAt'],
    },
  ],
});

// 관계 설정: 제품과 가격 이력 (1:N)
Product.hasMany(PriceHistory, { foreignKey: 'productId' });
PriceHistory.belongsTo(Product, { foreignKey: 'productId' });

// 관계 설정: 판매처와 가격 이력 (1:N)
SellerSite.hasMany(PriceHistory, { foreignKey: 'sellerId' });
PriceHistory.belongsTo(SellerSite, { foreignKey: 'sellerId' });

module.exports = PriceHistory;
