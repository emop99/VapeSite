// 모델 인덱스 파일
// 모든 모델을 한 곳에서 내보내기

const Company = require('./Company');
const ProductCategory = require('./ProductCategory');
const Product = require('./Product');
const SellerSite = require('./SellerSite');
const PriceComparison = require('./PriceComparisons');
const PriceHistory = require('./PriceHistory');
const User = require('./User');
const UserLoginLog = require('./UserLoginLog');
const Review = require('./Review');
const Board = require('./Board');
const Attachment = require('./Attachment');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Notification = require('./Notification');
const NotificationSettings = require('./NotificationSettings');
const PushSubscription = require('./PushSubscription');
const BoardNotificationPreference = require('./BoardNotificationPreference');
const PurchaseClickLog = require('./PurchaseClickLog');
const ProductsViewCount = require('./ProductsViewCount');
const WishList = require('./WishList');
// 모델 간의 관계는 각 모델 파일에서 정의됨

module.exports = {
  Company,
  ProductCategory,
  Product,
  SellerSite,
  PriceComparison,
  PriceHistory,
  User,
  UserLoginLog,
  Review,
  Board,
  Attachment,
  Post,
  Comment,
  Like,
  Notification,
  NotificationSettings,
  PushSubscription,
  BoardNotificationPreference,
  PurchaseClickLog,
  ProductsViewCount,
  WishList,
};
