import {Board, Comment, Post, User} from '../../../../models';
import {getServerSession} from 'next-auth/next';

export default async function handler(req, res) {
  // 요청 메소드에 따라 처리
  if (req.method === 'GET') {
    return getPosts(req, res);
  } else if (req.method === 'POST') {
    return createPost(req, res);
  } else {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }
}

// 게시글 목록 조회
async function getPosts(req, res) {
  const {boardId, page = 1, limit = 10} = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  // 게시판 ID 확인
  if (!boardId) {
    return res.status(400).json({message: '게시판 ID가 필요합니다.'});
  }

  try {
    // 게시판 존재 여부 확인
    const board = await Board.findOne({
      where: {
        id: boardId,
        isActive: true,
        deletedAt: null
      }
    });

    if (!board) {
      return res.status(404).json({message: '게시판을 찾을 수 없습니다.'});
    }

    // 총 게시글 수 조회
    const totalPosts = await Post.count({
      where: {
        boardId: boardId,
        deletedAt: null
      }
    });

    // 페이지네이션 계산
    const totalPages = Math.ceil(totalPosts / limitNumber);
    const offset = (pageNumber - 1) * limitNumber;

    // 공지사항 게시글 조회
    const noticePostsQuery = {
      where: {
        boardId: boardId,
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
        boardId: boardId,
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

    // 댓글 수를 게시글 객체에 추가
    const postsWithCommentCount = allPosts.map(post => {
      const postObject = post.toJSON();
      const commentData = commentCounts.find(c => c.postId === post.id);
      postObject.commentCount = commentData ? parseInt(commentData.count) : 0;
      return postObject;
    });

    // 결과 반환
    return res.status(200).json({
      posts: postsWithCommentCount,
      totalPages,
      currentPage: pageNumber,
      totalPosts
    });
  } catch (error) {
    console.error('게시글 목록 조회 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}

// 게시글 작성
async function createPost(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {boardId, title, content, isNotice = false} = req.body;

  // 필수 필드 확인
  if (!boardId) {
    return res.status(400).json({message: '게시판 ID가 필요합니다.'});
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({message: '제목이 필요합니다.'});
  }

  if (!content || content.trim() === '') {
    return res.status(400).json({message: '내용이 필요합니다.'});
  }

  try {
    // User 정보 확인
    const user = await User.findOne({
      where: {
        email: session.user.email,
        deletedAt: null // 탈퇴하지 않은 사용자만
      }
    });

    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 게시판 존재 여부 확인
    const board = await Board.findOne({
      where: {
        id: boardId,
        isActive: true,
        deletedAt: null
      }
    });

    if (!board) {
      return res.status(404).json({message: '게시판을 찾을 수 없습니다.'});
    }

    // 공지사항 권한 확인 (관리자만 가능)
    if (isNotice && user.grade !== 'ADMIN') {
      return res.status(403).json({message: '공지사항 작성 권한이 없습니다.'});
    }

    // 내용에 이미지 태그가 포함되어 있는지 확인
    const hasImage = content.includes('<img');

    // 게시글 생성
    const post = await Post.create({
      boardId,
      userId: user.id,
      title,
      content,
      isNotice: isNotice && user.grade === 'ADMIN',
      viewCount: 0,
      hasImage,
    });

    // 생성된 게시글 조회 (사용자 정보 포함)
    const createdPost = await Post.findOne({
      where: {
        id: post.id
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickName'],
        },
        {
          model: Board,
          attributes: ['id', 'name', 'slug'],
        }
      ],
      attributes: [
        'id', 'boardId', 'userId', 'title', 'content', 'viewCount',
        'isNotice', 'createdAt', 'updatedAt'
      ]
    });

    // 결과 반환
    return res.status(201).json({
      message: '게시글이 작성되었습니다.',
      post: createdPost
    });
  } catch (error) {
    console.error('게시글 작성 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}
