// 전자담배 제품 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');
const Company = require('./Company');
const ProductCategory = require('./ProductCategory');

// 제품 모델 정의
const Product = sequelize.define('Product', {
  // 제품 ID (기본 키)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 제조사 ID (외래 키)
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Company,
      key: 'id',
    },
  },
  // 제품 카테고리 ID (외래 키)
  productCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ProductCategory,
      key: 'id',
    },
  },
  // 상품 그룹 처리 Key Name
  productGroupingName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // Front 노출 상품명
  visibleName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // 상품 노출 여부
  isShow: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // 기본값은 true로 설정
  },
  // 이미지 URL
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // 상품 조회수
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // 기본값은 0으로 설정
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_products',
  // 타임스탬프 활성화 (createdAt, updatedAt)
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_products_createdAt_index',
      fields: ['createdAt'],
    },
    {
      name: 'vape_products_productGroupingName_index',
      fields: ['productGroupingName'],
    },
    {
      name: 'vape_products_visibleName_index',
      fields: ['visibleName'],
    },
    {
      // 전문 검색(fulltext) 인덱스 추가
      name: 'products_name_ft',
      type: 'FULLTEXT',
      fields: ['visibleName', 'productGroupingName'],
    },
  ],
});

// 관계 설정: 제조사와 제품 (1:N)
Company.hasMany(Product, { foreignKey: 'companyId' });
Product.belongsTo(Company, { foreignKey: 'companyId' });

// 관계 설정: 제품 카테고리와 제품 (1:N)
ProductCategory.hasMany(Product, { foreignKey: 'productCategoryId' });
Product.belongsTo(ProductCategory, { foreignKey: 'productCategoryId' });

module.exports = Product;
