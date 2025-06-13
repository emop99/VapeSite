// 커뮤니티 게시글 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');
const Board = require('./Board');
const User = require('./User');

// 게시글 모델 정의
const Post = sequelize.define('Post', {
  // 기본 키 ID (auto increment)
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 게시판 ID (외래 키)
  boardId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Board,
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
  // 게시글 제목
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  // 게시글 내용
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // 조회수
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  // 공지사항 여부
  isNotice: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // 삭제 일시
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_post',
  // 타임스탬프 설정
  timestamps: true,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_post_boardId_index',
      fields: ['boardId'],
    },
    {
      name: 'vape_post_userId_index',
      fields: ['userId'],
    },
    {
      name: 'vape_post_isNotice_index',
      fields: ['isNotice'],
    },
    {
      name: 'vape_post_createdAt_index',
      fields: ['createdAt'],
    },
  ],
});

// 관계 설정: 게시판과 게시글 (1:N)
Board.hasMany(Post, {
  foreignKey: 'boardId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Post.belongsTo(Board, {
  foreignKey: 'boardId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

// 관계 설정: 유저와 게시글 (1:N)
User.hasMany(Post, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});
Post.belongsTo(User, {
  foreignKey: 'userId',
  constraints: true,
  foreignKeyConstraint: true,
  onDelete: 'CASCADE',
});

module.exports = Post;