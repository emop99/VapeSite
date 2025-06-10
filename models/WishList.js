// 찜 목록 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const User = require('./User');
const Product = require('./Product');

// 찜 목록 모델 정의
const WishList = sequelize.define('WishList', {
  // 사용자 ID (복합 기본 키)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  // 상품 ID (복합 기본 키)
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Product,
      key: 'id'
    }
  },
  // 생성일
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  // 테이블 이름 설정
  tableName: 'vape_wish_list',
  // 타임스탬프 설정 (createdAt만 사용, updatedAt은 사용 안함)
  timestamps: true,
  updatedAt: false,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_wish_list_userId_index',
      fields: ['userId']
    },
    {
      name: 'vape_wish_list_productId_index',
      fields: ['productId']
    }
  ]
});

// 관계 설정: 사용자와 찜 목록 (1:N)
User.hasMany(WishList, {foreignKey: 'userId'});
WishList.belongsTo(User, {foreignKey: 'userId'});

// 관계 설정: 제품과 찜 목록 (1:N)
Product.hasMany(WishList, {foreignKey: 'productId'});
WishList.belongsTo(Product, {foreignKey: 'productId'});

module.exports = WishList;
