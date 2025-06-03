// 가격 비교 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');
const Product = require('./Product');
const SellerSite = require('./SellerSite');

// 가격 비교 모델 정의
const PriceComparisons = sequelize.define('PriceComparisons', {
  // 판매처 URL (기본 키)
  sellerUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    primaryKey: true,
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
  // 가격
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_price_comparisons',
  // 타임스탬프 설정
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// 관계 설정: 제품과 가격 비교 (1:N)
Product.hasMany(PriceComparisons, {
  foreignKey: 'productId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  as: 'priceComparisons'
});
PriceComparisons.belongsTo(Product, {
  foreignKey: 'productId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  as: 'product'
});

// 관계 설정: 판매처와 가격 비교 (1:N)
SellerSite.hasMany(PriceComparisons, {
  foreignKey: 'sellerId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  as: 'priceComparisons'
});
PriceComparisons.belongsTo(SellerSite, {
  foreignKey: 'sellerId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  as: 'seller'
});

module.exports = PriceComparisons;
