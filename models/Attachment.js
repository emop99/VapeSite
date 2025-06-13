// 게시글/댓글 첨부파일 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');

// 첨부파일 모델 정의
const Attachment = sequelize.define('Attachment', {
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
  },
  // 대상 타입 (게시글 또는 댓글)
  targetType: {
    type: DataTypes.ENUM('post', 'comment'),
    allowNull: false,
  },
  // 대상 ID (게시글 ID 또는 댓글 ID)
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 파일명
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  // 파일 경로
  filePath: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  // 파일 크기
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 파일 타입
  fileType: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_attachment',
  // 타임스탬프 설정
  createdAt: 'createdAt',
  updatedAt: false,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_attachment_target_index',
      fields: ['targetType', 'targetId'],
    },
  ],
});

// 관계 설정: 유저와 첨부파일 (1:N)
User.hasMany(Attachment, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Attachment.belongsTo(User, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

// 관계 설정: 게시글과 첨부파일 (1:N, 조건부)
Post.hasMany(Attachment, {
  foreignKey: 'targetId',
  constraints: false,
  scope: {
    targetType: 'post'
  },
  as: 'Attachments',
});

// 관계 설정: 댓글과 첨부파일 (1:N, 조건부)
Comment.hasMany(Attachment, {
  foreignKey: 'targetId',
  constraints: false,
  scope: {
    targetType: 'comment'
  },
  as: 'Attachments',
});

module.exports = Attachment;