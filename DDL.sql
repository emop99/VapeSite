create table vapesite.vape_board
(
    id          int auto_increment
        primary key,
    name        varchar(100)                           not null,
    description text                                   null,
    slug        varchar(100)                           not null,
    isActive    tinyint(1) default 1                   not null,
    createdAt   datetime   default current_timestamp() not null,
    updatedAt   datetime   default current_timestamp() null on update current_timestamp(),
    deletedAt   datetime                               null,
    constraint vape_board_slug_pk
        unique (slug)
)
    comment '커뮤니티 게시판 정보 테이블';

create index vape_board_isActive_index
    on vapesite.vape_board (isActive);

create table vapesite.vape_company
(
    id        int auto_increment
        primary key,
    name varchar(50) not null comment '회사명',
    createdAt datetime default current_timestamp() null,
    constraint vape_company_pk
        unique (name)
)
    comment '제조사 정보 테이블';

create table vapesite.vape_product_category
(
    id        int auto_increment
        primary key,
    name      varchar(15)                          not null,
    createdAt datetime default current_timestamp() not null,
    updatedAt datetime default current_timestamp() null on update current_timestamp()
);

create table vapesite.vape_products
(
    id                  int auto_increment
        primary key,
    companyId           int                                    not null,
    productCategoryId   int                                    not null,
    productGroupingName varchar(100)                           not null comment '상품 그룹 처리 Key Name',
    visibleName         varchar(100)                           not null comment 'Front 노출 상품명',
    isShow              tinyint(1) default 1                   not null comment '상품 노출 여부',
    isRedisplayed       tinyint(1) default 1                   not null,
    imageUrl            varchar(255)                           null,
    createdAt           datetime   default current_timestamp() not null,
    updatedAt           datetime   default current_timestamp() null on update current_timestamp(),
    viewCount           int        default 0                   not null comment '상품 조회수',
    constraint vape_products_vape_company_id_fk
        foreign key (companyId) references vapesite.vape_company (id),
    constraint vape_products_vape_product_category_id_fk
        foreign key (productCategoryId) references vapesite.vape_product_category (id)
)
    comment '상품 정보 테이블';

create fulltext index products_name_ft
    on vapesite.vape_products (visibleName, productGroupingName);

create index vape_products_createdAt_index
    on vapesite.vape_products (createdAt);

create index vape_products_productGroupingName_index
    on vapesite.vape_products (productGroupingName);

create index vape_products_visibleName_index
    on vapesite.vape_products (visibleName);

create table vapesite.vape_products_view_count
(
    productId int                                  not null,
    viewCount int      default 0                   not null,
    viewDate  date     default current_timestamp() not null,
    updatedAt datetime default current_timestamp() null on update current_timestamp(),
    primary key (viewDate, productId),
    constraint vape_products_view_count_vape_products_id_fk
        foreign key (productId) references vapesite.vape_products (id)
)
    comment '상품 조회수 테이블';

create index vape_products_view_count_viewDate_index
    on vapesite.vape_products_view_count (viewDate);

create table vapesite.vape_seller_site
(
    id        int auto_increment
        primary key,
    siteUrl   varchar(100)                         not null,
    name      varchar(50)                          not null,
    createdAt datetime default current_timestamp() not null,
    updatedAt datetime default current_timestamp() null on update current_timestamp(),
    constraint sellerSite_pk_2
        unique (name)
)
    comment '판매 사이트 정보 테이블';

create table vapesite.vape_price_comparisons
(
    id          int auto_increment
        primary key,
    productId   int                                  not null,
    sellerId    int                                  not null,
    sellerUrl   varchar(500)                         not null,
    originTitle varchar(255) null comment '사이트 상품명',
    price       int                                  not null,
    createdAt   datetime default current_timestamp() not null,
    updatedAt   datetime default current_timestamp() null on update current_timestamp(),
    constraint vape_price_comparisons_vape_products_id_fk
        foreign key (productId) references vapesite.vape_products (id),
    constraint vape_price_comparisons_vape_seller_site_id_fk
        foreign key (sellerId) references vapesite.vape_seller_site (id)
)
    comment '판매 사이트별 현재 가격 정보 테이블';

create table vapesite.vape_price_history
(
    id        int auto_increment
        primary key,
    productId        int                                  not null,
    sellerId         int                                  not null,
    newPrice         int                                  not null comment '변동된 가격',
    oldPrice         int                                  not null comment '이전 가격',
    priceDifference  int      default 0                   null comment '가격 차',
    percentageChange float    default 0                   null comment '백분율 변화 정보',
    createdAt datetime default current_timestamp() not null,
    constraint vape_price_history_vape_products_id_fk
        foreign key (productId) references vapesite.vape_products (id),
    constraint vape_price_history_vape_seller_site_id_fk
        foreign key (sellerId) references vapesite.vape_seller_site (id)
)
    comment '판매 사이트별 가격 변동 시 저장되는 테이블';

create index vape_price_history_createdAt_index
    on vapesite.vape_price_history (createdAt);

create index vape_price_history_productId_index
    on vapesite.vape_price_history (productId);

create table vapesite.vape_user
(
    id                  int auto_increment
        primary key,
    email               varchar(50)                          not null,
    password            varchar(200)                         not null comment '계정 비밀번호',
    nickName            varchar(25)                          not null,
    grade               enum ('NORMAL', 'PREMIUM', 'ADMIN') default 'NORMAL'            not null comment '회원 등급 설정',
    emailVerification   tinyint  default 0                   not null comment '이메일 인증 여부',
    emailVerificationAt datetime                             null comment '이메일 인증 일시',
    provider            enum ('google')                      null comment '소셜 로그인 제공자',
    providerId          varchar(255)                         null comment '소셜 로그인 제공자 ID',
    createdAt           datetime default current_timestamp() not null,
    updatedAt           datetime default current_timestamp() null on update current_timestamp(),
    deletedAt           datetime                             null comment '회원 탈퇴 일시',
    constraint vape_user_pk
        unique (email)
)
    comment '유저 정보 테이블';

create table vapesite.vape_attachment
(
    id         int auto_increment
        primary key,
    userId     int                                  not null,
    targetType enum ('post', 'comment')             not null,
    targetId   int                                  not null,
    fileName   varchar(255)                         not null,
    filePath   varchar(255)                         not null,
    fileSize   int                                  not null,
    fileType   varchar(100)                         not null,
    createdAt  datetime default current_timestamp() not null,
    constraint vape_attachment_ibfk_1
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '게시글/댓글 첨부파일 테이블';

create index userId
    on vapesite.vape_attachment (userId);

create index vape_attachment_target_index
    on vapesite.vape_attachment (targetType, targetId);

create table vapesite.vape_board_notification_preferences
(
    id        int auto_increment
        primary key,
    userId    int                                    not null comment '사용자 ID',
    boardId   int                                    not null comment '게시판 ID',
    enabled   tinyint(1) default 1                   not null comment '해당 게시판 푸시 알림 활성화 여부',
    createdAt datetime   default current_timestamp() not null,
    updatedAt datetime   default current_timestamp() not null on update current_timestamp(),
    constraint vape_board_notification_preferences_unique
        unique (userId, boardId),
    constraint fk_board_notification_board
        foreign key (boardId) references vapesite.vape_board (id)
            on delete cascade,
    constraint fk_board_notification_user
        foreign key (userId) references vapesite.vape_user (id)
            on delete cascade
)
    comment '게시판별 푸시 알림 설정 테이블' collate = utf8mb4_unicode_ci;

create index vape_board_notification_preferences_boardId_index
    on vapesite.vape_board_notification_preferences (boardId);

create index vape_board_notification_preferences_userId_index
    on vapesite.vape_board_notification_preferences (userId);

create table vapesite.vape_like
(
    id         int auto_increment
        primary key,
    userId     int                                  not null,
    targetType enum ('post', 'comment')             not null,
    targetId   int                                  not null,
    createdAt  datetime default current_timestamp() not null,
    constraint vape_like_unique
        unique (userId, targetType, targetId),
    constraint vape_like_ibfk_1
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '게시글/댓글 좋아요 테이블';

create index vape_like_target_index
    on vapesite.vape_like (targetType, targetId);

create table vapesite.vape_notification_settings
(
    id             int auto_increment
        primary key,
    userId         int                                    not null,
    commentEnabled tinyint(1) default 1                   not null comment '댓글 알림 활성화 여부',
    likeEnabled    tinyint(1) default 1                   not null comment '좋아요 알림 활성화 여부',
    replyEnabled   tinyint(1) default 1                   not null comment '답글 알림 활성화 여부',
    emailEnabled   tinyint(1) default 0                   not null comment '이메일 알림 활성화 여부',
    pushEnabled    tinyint(1) default 1                   not null comment '웹 푸시 알림 활성화 여부',
    createdAt      datetime   default current_timestamp() not null,
    updatedAt      datetime   default current_timestamp() not null on update current_timestamp(),
    constraint userId
        unique (userId),
    constraint fk_notification_settings_user
        foreign key (userId) references vapesite.vape_user (id)
            on delete cascade
)
    collate = utf8mb4_unicode_ci;

create index vape_notification_settings_userId_index
    on vapesite.vape_notification_settings (userId);

create table vapesite.vape_post
(
    id        int auto_increment
        primary key,
    boardId   int                                    not null,
    userId    int                                    not null,
    title     varchar(200)                           not null,
    content   text                                   not null,
    viewCount int        default 0                   not null,
    isNotice  tinyint(1) default 0                   not null,
    hasImage  tinyint(1) default 0                   null,
    createdAt datetime   default current_timestamp() not null,
    updatedAt datetime   default current_timestamp() null on update current_timestamp(),
    deletedAt datetime                               null,
    constraint vape_post_ibfk_1
        foreign key (boardId) references vapesite.vape_board (id),
    constraint vape_post_ibfk_2
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '커뮤니티 게시글 테이블';

create table vapesite.vape_comment
(
    id        int auto_increment
        primary key,
    postId    int                                  not null,
    userId    int                                  not null,
    parentId  int                                  null,
    content   text                                 not null,
    imageUrl  varchar(500)                         null,
    createdAt datetime default current_timestamp() not null,
    updatedAt datetime default current_timestamp() null on update current_timestamp(),
    deletedAt datetime                             null,
    constraint vape_comment_ibfk_1
        foreign key (postId) references vapesite.vape_post (id),
    constraint vape_comment_ibfk_2
        foreign key (userId) references vapesite.vape_user (id),
    constraint vape_comment_ibfk_3
        foreign key (parentId) references vapesite.vape_comment (id)
)
    comment '게시글 댓글 테이블';

create index vape_comment_createdAt_index
    on vapesite.vape_comment (createdAt);

create index vape_comment_parentId_index
    on vapesite.vape_comment (parentId);

create index vape_comment_postId_index
    on vapesite.vape_comment (postId);

create index vape_comment_userId_index
    on vapesite.vape_comment (userId);

create table vapesite.vape_notification
(
    id        int auto_increment
        primary key,
    userId    int                                                     not null comment '알림을 받을 유저',
    senderId  int                                                     not null,
    type      enum ('comment', 'like', 'reply', 'new_post', 'system') not null comment '알림 유형',
    postId    int                                                     not null,
    commentId int                                                     null,
    content   varchar(500)                                            not null,
    url       varchar(500)                                            not null,
    isRead    tinyint(1) default 0                                    not null comment '읽음 여부',
    createdAt datetime   default current_timestamp()                  not null,
    constraint fk_notification_comment
        foreign key (commentId) references vapesite.vape_comment (id)
            on delete cascade,
    constraint fk_notification_post
        foreign key (postId) references vapesite.vape_post (id)
            on delete cascade,
    constraint fk_notification_sender
        foreign key (senderId) references vapesite.vape_user (id)
            on delete cascade,
    constraint vape_notification_ibfk_1
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '유저 알림 테이블';

create index vape_notification_commentId_index
    on vapesite.vape_notification (commentId);

create index vape_notification_postId_index
    on vapesite.vape_notification (postId);

create index vape_notification_senderId_index
    on vapesite.vape_notification (senderId);

create index vape_notification_userId_index
    on vapesite.vape_notification (userId);

create index vape_post_boardId_index
    on vapesite.vape_post (boardId);

create index vape_post_createdAt_index
    on vapesite.vape_post (createdAt);

create index vape_post_isNotice_index
    on vapesite.vape_post (isNotice);

create index vape_post_userId_index
    on vapesite.vape_post (userId);

create table vapesite.vape_purchase_click_log
(
    id           int auto_increment
        primary key,
    productId    int                                                                  not null comment '클릭된 상품 ID',
    sellerId     int                                                                  not null comment '클릭된 판매사이트 ID',
    userId       int                                                                  null comment '클릭한 유저 ID (로그인한 경우)',
    ip           varchar(50)                                                          null comment '클라이언트 IP 주소',
    clickType    enum ('main_button', 'comparison_table') default 'main_button'       not null comment '클릭 버튼 유형',
    priceAtClick int                                                                  not null comment '클릭 시점의 상품 가격',
    createdAt    datetime                                 default current_timestamp() not null comment '클릭 발생 일시',
    constraint vape_purchase_click_log_vape_products_id_fk
        foreign key (productId) references vapesite.vape_products (id),
    constraint vape_purchase_click_log_vape_seller_site_id_fk
        foreign key (sellerId) references vapesite.vape_seller_site (id),
    constraint vape_purchase_click_log_vape_user_id_fk
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '구매하러가기 버튼 클릭 로그 테이블';

create index vape_purchase_click_log_createdAt_index
    on vapesite.vape_purchase_click_log (createdAt);

create index vape_purchase_click_log_productId_index
    on vapesite.vape_purchase_click_log (productId);

create index vape_purchase_click_log_sellerId_index
    on vapesite.vape_purchase_click_log (sellerId);

create table vapesite.vape_push_subscription
(
    id             int auto_increment
        primary key,
    userId         int                                  not null,
    endpoint       varchar(500)                         not null comment '푸시 서비스 엔드포인트 URL',
    p256dh         varchar(255)                         not null comment 'P256DH 공개 키',
    auth           varchar(255)                         not null comment '인증 비밀 키',
    userAgent      varchar(500)                         null comment '브라우저 사용자 에이전트',
    expirationTime datetime                             null comment '구독 만료 일시',
    createdAt      datetime default current_timestamp() not null,
    updatedAt      datetime default current_timestamp() not null on update current_timestamp(),
    constraint vape_push_subscription_endpoint_index
        unique (endpoint),
    constraint fk_push_subscription_user
        foreign key (userId) references vapesite.vape_user (id)
            on delete cascade
)
    collate = utf8mb4_unicode_ci;

create index vape_push_subscription_userId_index
    on vapesite.vape_push_subscription (userId);

create table vapesite.vape_reviews
(
    id           int auto_increment
        primary key,
    productId    int                                  not null,
    userId       int                                  not null comment '작성자 유저 번호',
    rating       tinyint  default 1                   not null comment '평점(1~5)'
        check (`rating` between 1 and 5),
    title        varchar(100)                         not null,
    content      text                                 not null,
    recommended  tinyint(1) default 0                   null comment '추천 여부',
    pros         varchar(500)                         not null comment '장점',
    cons         varchar(500)                         not null comment '단점',
    helpfulCount int      default 0                   null comment '도움이 됨 개수',
    createdAt    datetime default current_timestamp() not null,
    updatedAt    datetime default current_timestamp() null on update current_timestamp(),
    constraint vape_reviews_ibfk_1
        foreign key (productId) references vapesite.vape_products (id),
    constraint vape_reviews_vape_user_id_fk
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '판매 상품 리뷰 테이블';

create index productId
    on vapesite.vape_reviews (productId);

create index vape_user_emailVerification_index
    on vapesite.vape_user (emailVerification);

create index vape_user_grade_index
    on vapesite.vape_user (grade);

create index vape_user_nickName_index
    on vapesite.vape_user (nickName);

create table vapesite.vape_user_login_log
(
    id        int auto_increment
        primary key,
    userId    int                                  not null,
    ip varchar(50) null,
    createdAt datetime default current_timestamp() not null,
    constraint vape_user_login_log_vape_user_id_fk
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '회원 로그인 로그';

create table vapesite.vape_wish_list
(
    userId    int not null,
    productId int not null,
    createdAt datetime default current_timestamp() null,
    primary key (productId, userId),
    constraint vape_wish_list_vape_products_id_fk
        foreign key (productId) references vapesite.vape_products (id),
    constraint vape_wish_list_vape_user_id_fk
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '찜 목록 테이블';

CREATE TABLE IF NOT EXISTS vape_search_logs
(
    id             INT AUTO_INCREMENT PRIMARY KEY COMMENT '검색 로그 ID',
    user_id        INT          NULL COMMENT '사용자 ID (로그인한 경우)',
    search_keyword VARCHAR(255) NULL COMMENT '메인 검색어',
    or_keywords    JSON         NULL COMMENT 'OR 검색어 (JSON 배열 형태)',
    category       VARCHAR(100) NULL COMMENT '검색 시 선택한 카테고리',
    ip_address     VARCHAR(45)  NULL COMMENT '검색자 IP 주소',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '검색 일시',
    INDEX idx_search_keyword (search_keyword),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES vapesite.vape_user (id) ON DELETE SET NULL
    ) ENGINE = InnoDB
    DEFAULT CHARSET = utf8mb4
    COLLATE = utf8mb4_unicode_ci COMMENT ='검색어 트래킹 테이블';

create
    definer = vapeuser@localhost procedure vapesite.get_similar_products(IN p_product_id int)
BEGIN
    -- 현재 상품 정보 가져오기
    DECLARE
        product_name TEXT;
    DECLARE
        category_id INT;

    SELECT CONCAT(visibleName, ' ', productGroupingName),
           productCategoryId
    INTO
        product_name,
        category_id
    FROM vape_products
    WHERE id = p_product_id;

-- 유사 상품 찾기
    SELECT p.id,
           p.visibleName,
           p.productGroupingName,
           p.imageUrl,
           MATCH (p.visibleName, p.productGroupingName)
               AGAINST (product_name IN NATURAL LANGUAGE MODE) AS relevance,
           (SELECT MIN(price)
            FROM vape_price_comparisons vpc
            WHERE vpc.productId = p.id)                        AS min_price
    FROM vape_products p
    WHERE p.id != p_product_id
      AND p.productCategoryId = category_id
      AND p.isShow = 1
      AND MATCH (p.visibleName
              , p.productGroupingName)
              AGAINST (product_name IN NATURAL LANGUAGE MODE)
        > 0
    GROUP BY p.id
    ORDER BY relevance DESC
    LIMIT 10;
END;

