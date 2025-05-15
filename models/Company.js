// 제조사 정보 모델
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/db');

// 제조사 모델 정의
const Company = sequelize.define('Company', {
  // 제조사 ID (기본 키)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 회사명
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_company',
  // 타임스탬프 설정
  createdAt: 'createdAt',
  updatedAt: false,
});

module.exports = Company;