// 웹 푸시 구독 정보 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const User = require('./User');

// 푸시 구독 모델 정의
const PushSubscription = sequelize.define('PushSubscription', {
  // 기본 키 ID (auto increment)
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 유저 ID (외래 키)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    comment: '구독 소유자 유저 ID',
  },
  // 엔드포인트 URL
  endpoint: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '푸시 서비스 엔드포인트 URL',
  },
  // P256DH 키 (암호화에 사용)
  p256dh: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'P256DH 공개 키',
  },
  // Auth 비밀 키
  auth: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '인증 비밀 키',
  },
  // 사용자 에이전트 정보
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '브라우저 사용자 에이전트',
  },
  // 만료 일시
  expirationTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '구독 만료 일시',
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_push_subscription',
  // 타임스탬프 설정
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_push_subscription_userId_index',
      fields: ['userId'],
    },
    {
      name: 'vape_push_subscription_endpoint_index',
      fields: ['endpoint'],
      unique: true,
    },
  ],
});

// 관계 설정: 유저와 푸시 구독 (1:N)
User.hasMany(PushSubscription, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
PushSubscription.belongsTo(User, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

module.exports = PushSubscription;