// 제품 리뷰 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');
const Product = require('./Product');
const User = require('./User');

// 제품 리뷰 모델 정의
const Review = sequelize.define('Review', {
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
  // 유저 ID (외래 키)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  // 평점 (1-5)
  rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5,
    },
  },
  // 리뷰 제목
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // 리뷰 내용
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // 장점
  pros: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  // 단점
  cons: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  // 추천 여부
  recommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0,
    allowNull: true,
  },
  // 도움이 됨 수
  helpfulCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_reviews',
  // 타임스탬프 활성화 (createdAt, updatedAt)
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'productId',
      fields: ['productId'],
    },
  ],
});

// 관계 설정: 제품과 리뷰 (1:N)
Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// 관계 설정: 유저와 리뷰 (1:N)
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

module.exports = Review;
