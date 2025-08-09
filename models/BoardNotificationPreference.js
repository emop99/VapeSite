// 게시판별 푸시 알림 설정 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const User = require('./User');
const Board = require('./Board');

// 게시판 알림 설정 모델 정의
const BoardNotificationPreference = sequelize.define('BoardNotificationPreference', {
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
    comment: '사용자 ID',
  },
  // 게시판 ID (외래 키)
  boardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Board,
      key: 'id',
    },
    comment: '게시판 ID',
  },
  // 알림 활성화 여부
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '해당 게시판 푸시 알림 활성화 여부',
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_board_notification_preferences',
  // 타임스탬프 설정
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_board_notification_preferences_userId_index',
      fields: ['userId'],
    },
    {
      name: 'vape_board_notification_preferences_boardId_index',
      fields: ['boardId'],
    },
    {
      name: 'vape_board_notification_preferences_unique',
      fields: ['userId', 'boardId'],
      unique: true,
    },
  ],
});

// 관계 설정: 유저와 게시판 알림 설정 (1:N)
User.hasMany(BoardNotificationPreference, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
BoardNotificationPreference.belongsTo(User, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

// 관계 설정: 게시판과 게시판 알림 설정 (1:N)
Board.hasMany(BoardNotificationPreference, {
  foreignKey: 'boardId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
BoardNotificationPreference.belongsTo(Board, {
  foreignKey: 'boardId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

module.exports = BoardNotificationPreference;