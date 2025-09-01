// 구매 클릭 로그 모델
const {DataTypes} = require('sequelize');
const {sequelize} = require('../lib/db');

// 구매 클릭 로그 모델 정의
const PurchaseClickLog = sequelize.define('PurchaseClickLog', {
  // 로그 ID (기본 키)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // 클릭된 상품 ID
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 클릭된 판매사이트 ID
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 클릭한 유저 ID (로그인한 경우)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // 클라이언트 IP 주소
  ip: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  // 클릭 버튼 유형
  clickType: {
    type: DataTypes.ENUM('main_button', 'comparison_table'),
    defaultValue: 'main_button',
    allowNull: false,
  },
  // 클릭 시점의 상품 가격
  priceAtClick: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  // 테이블 이름 설정
  tableName: 'vape_purchase_click_log',
  // 타임스탬프 설정 (createdAt만 사용)
  timestamps: true,
  updatedAt: false,
  // 인덱스 설정
  indexes: [
    {
      name: 'vape_purchase_click_log_createdAt_index',
      fields: ['createdAt'],
    },
    {
      name: 'vape_purchase_click_log_productId_index',
      fields: ['productId'],
    },
    {
      name: 'vape_purchase_click_log_sellerId_index',
      fields: ['sellerId'],
    },
  ],
});

module.exports = PurchaseClickLog;