// 유저 알림 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const User = require('./User');

// 알림 모델 정의
const Notification = sequelize.define('Notification', {
  // 기본 키 ID (auto increment)
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 알림을 받을 유저 ID (외래 키)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    comment: '알림을 받을 유저',
  },
  // 알림 유형
  type: {
    type: DataTypes.ENUM('comment', 'like', 'reply'),
    allowNull: false,
    comment: '알림 유형',
  },
  // 관련된 게시글/댓글 ID
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '관련된 게시글/댓글 ID',
  },
  // 읽음 여부
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '읽음 여부',
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_notification',
  // 타임스탬프 설정
  createdAt: 'createdAt',
  updatedAt: false,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_notification_userId_index',
      fields: ['userId'],
    },
  ],
});

// 관계 설정: 유저와 알림 (1:N)
User.hasMany(Notification, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

module.exports = Notification;