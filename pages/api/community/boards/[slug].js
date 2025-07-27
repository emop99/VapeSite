import {Board, Comment, Like, Post, User} from '../../../../models';

export default async function handler(req, res) {
  // 요청 메소드 확인
  if (req.method !== 'GET') {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }

  const {slug, page = 1, limit = 20} = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  if (!slug) {
    return res.status(400).json({message: '게시판 슬러그가 필요합니다.'});
  }

  try {
    // 슬러그로 게시판 조회
    const board = await Board.findOne({
      where: {
        slug: slug,
        isActive: true,
        deletedAt: null
      },
      attributes: ['id', 'name', 'description', 'slug', 'isActive', 'createdAt', 'updatedAt']
    });

    // 게시판이 없는 경우
    if (!board) {
      return res.status(404).json({message: '게시판을 찾을 수 없습니다.'});
    }

    // 총 게시글 수 조회
    const totalPosts = await Post.count({
      where: {
        boardId: board.id,
        isNotice: false,
        deletedAt: null
      }
    });

    // 페이지네이션 계산
    const totalPages = Math.ceil(totalPosts / limitNumber);
    const offset = (pageNumber - 1) * limitNumber;

    // 공지사항 게시글 조회
    const noticePostsQuery = {
      where: {
        boardId: board.id,
        isNotice: true,
        deletedAt: null
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickName'],
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ],
      attributes: [
        'id', 'title', 'hasImage', 'viewCount', 'isNotice', 'createdAt', 'updatedAt'
      ]
    };

    // 일반 게시글 조회 (페이지네이션 적용)
    const regularPostsQuery = {
      where: {
        boardId: board.id,
        isNotice: false,
        deletedAt: null
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickName'],
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ],
      limit: limitNumber,
      offset: offset,
      attributes: [
        'id', 'title', 'hasImage', 'viewCount', 'isNotice', 'createdAt', 'updatedAt'
      ]
    };

    // 공지사항과 일반 게시글 조회
    const [noticePosts, regularPosts] = await Promise.all([
      Post.findAll(noticePostsQuery),
      Post.findAll(regularPostsQuery)
    ]);

    // 모든 게시글 ID 추출
    const allPosts = [...noticePosts, ...regularPosts];
    const postIds = allPosts.map(post => post.id);

    // 각 게시글의 댓글 수 조회
    const commentCounts = await Comment.findAll({
      attributes: ['postId', [Comment.sequelize.fn('COUNT', Comment.sequelize.col('id')), 'count']],
      where: {
        postId: postIds,
        deletedAt: null
      },
      group: ['postId'],
      raw: true
    });

    // 각 게시글의 좋아요 수 조회
    const likeCounts = await Like.findAll({
      attributes: ['targetId', [Like.sequelize.fn('COUNT', Like.sequelize.col('id')), 'count']],
      where: {
        targetId: postIds,
        targetType: 'post'
      },
      group: ['targetId'],
      raw: true
    });

    // 댓글 수와 좋아요 수를 게시글 객체에 추가
    const postsWithCounts = allPosts.map(post => {
      const postObject = post.toJSON();

      // 댓글 수 추가
      const commentData = commentCounts.find(c => c.postId === post.id);
      postObject.commentCount = commentData ? parseInt(commentData.count) : 0;

      // 좋아요 수 추가
      const likeData = likeCounts.find(l => l.targetId === post.id);
      postObject.likeCount = likeData ? parseInt(likeData.count) : 0;
      
      return postObject;
    });

    // 게시판 정보와 게시글 목록 반환
    return res.status(200).json({
      board,
      posts: postsWithCounts,
      totalPages,
      currentPage: pageNumber,
      totalPosts
    });
  } catch (error) {
    console.error('게시판 조회 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}
