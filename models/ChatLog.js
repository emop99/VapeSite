// 채팅 로그 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

const ChatLog = sequelize.define('ChatLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'vape_user',
      key: 'id',
    },
  },
  nickName: {
    type: DataTypes.STRING(25),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
}, {
  tableName: 'vape_chat_logs',
  timestamps: false, // createdAt만 명시적으로 사용
  defaultScope: {
    attributes: { exclude: ['ip'] }
  },
  indexes: [
    {
      name: 'idx_chat_createdAt',
      fields: ['createdAt'],
    },
  ],
});

module.exports = ChatLog;
