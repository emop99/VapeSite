// 유저 정보 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

// 유저 모델 정의
const User = sequelize.define('User', {
  // 유저 ID (기본 키)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 이메일
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  // 비밀번호
  password: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  // 닉네임
  nickName: {
    type: DataTypes.STRING(25),
    allowNull: false,
  },
  // 회원 등급
  grade: {
    type: DataTypes.ENUM('NORMAL', 'PREMIUM', 'ADMIN'),
    defaultValue: 'NORMAL',
    allowNull: false,
  },
  // 이메일 인증 여부
  emailVerification: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    allowNull: false,
  },
  // 이메일 인증 일시
  emailVerificationAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // 회원 탈퇴 일시
  deleteAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_user',
  // 타임스탬프 설정
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_user_emailVerification_index',
      fields: ['emailVerification'],
    },
    {
      name: 'vape_user_grade_index',
      fields: ['grade'],
    },
    {
      name: 'vape_user_nickName_index',
      fields: ['nickName'],
    },
  ],
});

module.exports = User;