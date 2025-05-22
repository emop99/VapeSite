// 회원 로그인 로그 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');
const User = require('./User');

// 회원 로그인 로그 모델 정의
const UserLoginLog = sequelize.define('UserLoginLog', {
  // 로그 ID (기본 키)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
}, {
  // 테이블 이름 설정
  tableName: 'vape_user_login_log',
  // 타임스탬프 설정
  createdAt: 'createdAt',
  updatedAt: false,
});

// 관계 설정: 유저와 로그인 로그 (1:N)
User.hasMany(UserLoginLog, { foreignKey: 'userId' });
UserLoginLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserLoginLog;
