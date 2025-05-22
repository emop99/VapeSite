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
  // 제품명
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // 이미지 URL
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_products',
  // 타임스탬프 활성화 (createdAt, updatedAt)
  timestamps: true,
  // 유니크 제약 조건
  indexes: [
    {
      name: 'vape_products_unique_company_name_category',
      unique: true,
      fields: ['companyId', 'name', 'productCategoryId'],
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
