// 유저 알림 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');

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
  // 알림을 발생시킨 유저 ID (외래 키)
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    comment: '알림을 발생시킨 유저',
  },
  // 알림 유형
  type: {
    type: DataTypes.ENUM('comment', 'like', 'reply', 'new_post'),
    allowNull: false,
    comment: '알림 유형',
  },
  // 관련된 게시글 ID
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'id',
    },
    comment: '관련된 게시글 ID',
  },
  // 관련된 댓글 ID (댓글 관련 알림인 경우)
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Comment,
      key: 'id',
    },
    comment: '관련된 댓글 ID (댓글 관련 알림인 경우)',
  },
  // 알림 내용
  content: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '알림 내용',
  },
  // 알림 링크 URL
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '알림 클릭 시 이동할 URL',
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
    {
      name: 'vape_notification_senderId_index',
      fields: ['senderId'],
    },
    {
      name: 'vape_notification_postId_index',
      fields: ['postId'],
    },
    {
      name: 'vape_notification_commentId_index',
      fields: ['commentId'],
    },
  ],
});

// 관계 설정: 수신자 유저와 알림 (1:N)
User.hasMany(Notification, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  as: 'Notifications',
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  as: 'Recipient',
});

// 관계 설정: 발신자 유저와 알림 (1:N)
User.hasMany(Notification, {
  foreignKey: 'senderId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  as: 'SentNotifications',
});
Notification.belongsTo(User, {
  foreignKey: 'senderId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
  as: 'Sender',
});

// 관계 설정: 게시글과 알림 (1:N)
Post.hasMany(Notification, {
  foreignKey: 'postId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Notification.belongsTo(Post, {
  foreignKey: 'postId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

// 관계 설정: 댓글과 알림 (1:N)
Comment.hasMany(Notification, {
  foreignKey: 'commentId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Notification.belongsTo(Comment, {
  foreignKey: 'commentId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

module.exports = Notification;