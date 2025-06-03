// 가격 변동 이력 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');
const Product = require('./Product');
const SellerSite = require('./SellerSite');

// 가격 변동 이력 모델 정의
const PriceHistory = sequelize.define('PriceHistory', {
  // 기본 키 ID (auto increment)
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 제품 ID (외래 키)
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
  },
  // 판매처 ID (외래 키)
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SellerSite,
      key: 'id',
    },
  },
  // 새 가격
  newPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
    {
      name: 'vape_price_history_productId_index',
      fields: ['productId'],
    }
  ],
});

// 관계 설정: 제품과 가격 이력 (1:N)
Product.hasMany(PriceHistory, {
  foreignKey: 'productId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
PriceHistory.belongsTo(Product, {
  foreignKey: 'productId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

// 관계 설정: 판매처와 가격 이력 (1:N)
SellerSite.hasMany(PriceHistory, {
  foreignKey: 'sellerId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
PriceHistory.belongsTo(SellerSite, {
  foreignKey: 'sellerId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

module.exports = PriceHistory;
