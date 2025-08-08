// 알림 설정 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const User = require('./User');

// 알림 설정 모델 정의
const NotificationSettings = sequelize.define('NotificationSettings', {
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
    unique: true,
    references: {
      model: User,
      key: 'id',
    },
    comment: '설정 소유자 유저 ID',
  },
  // 댓글 알림 활성화 여부
  commentEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '댓글 알림 활성화 여부',
  },
  // 좋아요 알림 활성화 여부
  likeEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '좋아요 알림 활성화 여부',
  },
  // 답글 알림 활성화 여부
  replyEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '답글 알림 활성화 여부',
  },
  // 이메일 알림 활성화 여부
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '이메일 알림 활성화 여부',
  },
  // 웹 푸시 알림 활성화 여부
  pushEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '웹 푸시 알림 활성화 여부',
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_notification_settings',
  // 타임스탬프 설정
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_notification_settings_userId_index',
      fields: ['userId'],
      unique: true,
    },
  ],
});

// 관계 설정: 유저와 알림 설정 (1:1)
User.hasOne(NotificationSettings, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
NotificationSettings.belongsTo(User, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

module.exports = NotificationSettings;