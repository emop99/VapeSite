// 레드닷 관리 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');

const RedDot = sequelize.define('RedDot', {
  targetKey: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
    comment: '레드닷 대상 키 (community, ranking 등)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '활성화 여부'
  }
}, {
  tableName: 'vape_red_dot',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = RedDot;
