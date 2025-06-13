// 게시글 댓글 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const Post = require('./Post');
const User = require('./User');

// 댓글 모델 정의
const Comment = sequelize.define('Comment', {
  // 기본 키 ID (auto increment)
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 게시글 ID (외래 키)
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'id',
    },
  },
  // 작성자 ID (외래 키)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  // 부모 댓글 ID (외래 키, 대댓글인 경우)
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Comment',
      key: 'id',
    },
  },
  // 댓글 내용
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // 삭제 일시
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_comment',
  // 타임스탬프 설정
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_comment_postId_index',
      fields: ['postId'],
    },
    {
      name: 'vape_comment_userId_index',
      fields: ['userId'],
    },
    {
      name: 'vape_comment_parentId_index',
      fields: ['parentId'],
    },
    {
      name: 'vape_comment_createdAt_index',
      fields: ['createdAt'],
    },
  ],
});

// 관계 설정: 게시글과 댓글 (1:N)
Post.hasMany(Comment, {
  foreignKey: 'postId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Comment.belongsTo(Post, {
  foreignKey: 'postId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

// 관계 설정: 유저와 댓글 (1:N)
User.hasMany(Comment, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Comment.belongsTo(User, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

// 관계 설정: 댓글과 대댓글 (1:N, 자기 참조)
Comment.hasMany(Comment, {
  foreignKey: 'parentId',
  as: 'Replies',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Comment.belongsTo(Comment, {
  foreignKey: 'parentId',
  as: 'Parent',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

module.exports = Comment;