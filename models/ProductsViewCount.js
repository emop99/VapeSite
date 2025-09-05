// 상품 조회수 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const Product = require('./Product');

// 상품 조회수 모델 정의
const ProductsViewCount = sequelize.define('ProductsViewCount', {
  // 상품 ID (외래 키, 복합 기본 키의 일부)
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Product,
      key: 'id',
    },
  },
  // 조회수
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  // 조회 날짜 (복합 기본 키의 일부)
  viewDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_products_view_count',
  // 타임스탬프 비활성화 (updatedAt만 사용)
  timestamps: false,
  // updatedAt 필드만 추가
  updatedAt: 'updatedAt',
  createdAt: false,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_products_view_count_viewDate_index',
      fields: ['viewDate'],
    },
  ],
});

// 관계 설정: 상품과 상품 조회수 (1:N)
Product.hasMany(ProductsViewCount, {foreignKey: 'productId'});
ProductsViewCount.belongsTo(Product, {foreignKey: 'productId'});

module.exports = ProductsViewCount;