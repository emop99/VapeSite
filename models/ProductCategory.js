// 제품 카테고리 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

// 제품 카테고리 모델 정의
const ProductCategory = sequelize.define('ProductCategory', {
  // 카테고리 ID (기본 키)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 카테고리명
  name: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_product_category',
  // 타임스탬프 설정
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

module.exports = ProductCategory;