// 가격 비교 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');
const Product = require('./Product');
const SellerSite = require('./SellerSite');

// 가격 비교 모델 정의
const PriceComparison = sequelize.define('PriceComparison', {
  // ID (기본 키)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
  // 판매처 URL
  sellerUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  // 가격
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_price_comparisons',
  // 타임스탬프 활성화 (createdAt, updatedAt)
  timestamps: true,
});

// 관계 설정: 제품과 가격 비교 (1:N)
Product.hasMany(PriceComparison, { foreignKey: 'productId' });
PriceComparison.belongsTo(Product, { foreignKey: 'productId' });

// 관계 설정: 판매처와 가격 비교 (1:N)
SellerSite.hasMany(PriceComparison, { foreignKey: 'sellerId' });
PriceComparison.belongsTo(SellerSite, { foreignKey: 'sellerId' });

module.exports = PriceComparison;
