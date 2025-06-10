create table vapesite.vape_company
(
    id        int auto_increment
        primary key,
    name      varchar(50)                          not null comment '회사명',
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
    imageUrl            varchar(255)                           null,
    createdAt           datetime   default current_timestamp() not null,
    updatedAt           datetime   default current_timestamp() null on update current_timestamp(),
    viewCount int default 0 not null comment '상품 조회수',
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
    id        int auto_increment
        primary key,
    productId int                                  not null,
    sellerId  int                                  not null,
    sellerUrl varchar(500) not null,
    price     int                                  not null,
    createdAt datetime default current_timestamp() not null,
    updatedAt datetime default current_timestamp() null on update current_timestamp(),
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
    email               varchar(50)                                                     not null,
    password            varchar(200)                                                    not null comment '계정 비밀번호',
    nickName            varchar(25)                                                     not null,
    grade               enum ('NORMAL', 'PREMIUM', 'ADMIN') default 'NORMAL'            not null comment '회원 등급 설정',
    emailVerification   tinyint                             default 0                   not null comment '이메일 인증 여부',
    emailVerificationAt datetime                                                        null comment '이메일 인증 일시',
    createdAt           datetime                            default current_timestamp() not null,
    updatedAt           datetime                            default current_timestamp() null on update current_timestamp(),
    deletedAt           datetime                                                        null comment '회원 탈퇴 일시',
    constraint vape_user_pk
        unique (email)
)
    comment '유저 정보 테이블';

create table vapesite.vape_reviews
(
    id           int auto_increment
        primary key,
    productId    int                                    not null,
    userId       int                                    not null comment '작성자 유저 번호',
    rating       tinyint    default 1                   not null comment '평점(1~5)'
        check (`rating` between 1 and 5),
    title        varchar(100)                           not null,
    content      text                                   not null,
    recommended  tinyint(1) default 0                   null comment '추천 여부',
    pros         tinytext                               not null comment '장점',
    cons         tinytext                               not null comment '단점',
    helpfulCount int        default 0                   null comment '도움이 됨 개수',
    createdAt    datetime   default current_timestamp() not null,
    updatedAt    datetime   default current_timestamp() null on update current_timestamp(),
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
    createdAt datetime default current_timestamp() not null,
    constraint vape_user_login_log_vape_user_id_fk
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '회원 로그인 로그';

create table vapesite.vape_wish_list
(
    userId    int                                  not null,
    productId int                                  not null,
    createdAt datetime default current_timestamp() null,
    primary key (productId, userId),
    constraint vape_wish_list_vape_products_id_fk
        foreign key (productId) references vapesite.vape_products (id),
    constraint vape_wish_list_vape_user_id_fk
        foreign key (userId) references vapesite.vape_user (id)
)
    comment '찜 목록 테이블';



create
    definer = vapeuser@`%` procedure vapesite.get_similar_products(IN p_product_id int)
BEGIN
    -- 현재 상품 정보 가져오기
    DECLARE product_name TEXT;
    DECLARE category_id INT;

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
      AND MATCH (p.visibleName, p.productGroupingName)
              AGAINST (product_name IN NATURAL LANGUAGE MODE) > 0
    GROUP BY p.id
    ORDER BY relevance DESC
    LIMIT 10;
END;