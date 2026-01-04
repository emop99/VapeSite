import { DataTypes } from 'sequelize';
import { sequelize } from '../lib/db';
import User from './User';

/**
 * 검색 로그 모델
 * 사용자의 검색 활동을 추적하는 테이블
 */
const SearchLog = sequelize.define('SearchLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '검색 로그 ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    comment: '사용자 ID (로그인한 경우)',
    references: {
      model: 'vape_user',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  searchKeyword: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'search_keyword',
    comment: '메인 검색어'
  },
  orKeywords: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'or_keywords',
    comment: 'OR 검색어 (JSON 배열 형태)'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '검색 시 선택한 카테고리'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address',
    comment: '검색자 IP 주소'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
    comment: '검색 일시'
  }
}, {
  tableName: 'vape_search_logs',
  timestamps: false,
  indexes: [
    {
      name: 'idx_search_keyword',
      fields: ['search_keyword']
    },
    {
      name: 'idx_category',
      fields: ['category']
    },
    {
      name: 'idx_created_at',
      fields: ['created_at']
    }
  ]
});

// User 모델과의 관계 설정
SearchLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export default SearchLog;
