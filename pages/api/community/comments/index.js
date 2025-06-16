import {Comment, Post, User} from '../../../../models';
import {getServerSession} from 'next-auth/next';
import Like from '../../../../models/Like';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // 요청 메소드에 따라 처리
  if (req.method === 'GET') {
    return getComments(req, res);
  } else if (req.method === 'POST') {
    return createComment(req, res);
  } else if (req.method === 'PUT') {
    return updateComment(req, res);
  } else if (req.method === 'DELETE') {
    return deleteComment(req, res);
  } else {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }
}

// 댓글 목록 조회
async function getComments(req, res) {
  const {postId} = req.query;

  if (!postId) {
    return res.status(400).json({message: '게시글 ID가 필요합니다.'});
  }

  try {
    // 게시글 존재 여부 확인
    const post = await Post.findOne({
      where: {
        id: postId,
        deletedAt: null
      }
    });

    if (!post) {
      return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    }

    // 로그인 사용자 정보 조회
    const session = await getServerSession(req, res);
    let userId = null;
    if (session && session.user) {
      const user = await User.findOne({
        where: {email: session.user.email, deletedAt: null}
      });
      if (user) userId = user.id;
    }

    // 댓글 목록 조회
    const comments = await Comment.findAll({
      where: {
        postId: postId,
        deletedAt: null
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickName'],
        }
      ],
      order: [
        ['createdAt', 'ASC']
      ],
      attributes: [
        'id', 'postId', 'userId', 'parentId', 'content', 'imageUrl', 'createdAt', 'updatedAt'
      ]
    });

    // 각 댓글에 좋아요 정보 추가
    const commentIds = comments.map(c => c.id);
    // 전체 댓글의 좋아요 수 조회
    const likeCounts = await Like.findAll({
      where: {
        targetType: 'comment',
        targetId: commentIds
      },
      attributes: ['targetId', [Like.sequelize.fn('COUNT', Like.sequelize.col('id')), 'count']],
      group: ['targetId']
    });
    const likeCountMap = {};
    likeCounts.forEach(like => {
      likeCountMap[like.targetId] = parseInt(like.get('count'), 10);
    });

    // 로그인 사용자의 좋아요 여부 조회
    let userLikesMap = {};
    if (userId) {
      const userLikes = await Like.findAll({
        where: {
          targetType: 'comment',
          targetId: commentIds,
          userId
        },
        attributes: ['targetId']
      });
      userLikesMap = userLikes.reduce((acc, like) => {
        acc[like.targetId] = true;
        return acc;
      }, {});
    }

    // 댓글 객체에 likeCount, likedByUser 추가
    const commentsWithLikes = comments.map(comment => {
      const c = comment.toJSON();
      c.likeCount = likeCountMap[comment.id] || 0;
      c.likedByUser = !!userLikesMap[comment.id];
      return c;
    });

    // 결과 반환
    return res.status(200).json({comments: commentsWithLikes});
  } catch (error) {
    console.error('댓글 목록 조회 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}

// 댓글 작성
async function createComment(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {postId, parentId, content, imageUrl} = req.body;

  // 필수 필드 확인
  if (!postId) {
    return res.status(400).json({message: '게시글 ID가 필요합니다.'});
  }

  if (!content || content.trim() === '') {
    return res.status(400).json({message: '댓글 내용이 필요합니다.'});
  }

  try {
    const user = await User.findOne({
      where: {
        email: session.user.email,
        deletedAt: null // 탈퇴하지 않은 사용자만
      }
    });

    // 게시글 존재 여부 확인
    const post = await Post.findOne({
      where: {
        id: postId,
        deletedAt: null
      }
    });

    if (!post) {
      return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    }

    // 부모 댓글 존재 여부 확인 (대댓글인 경우)
    if (parentId) {
      const parentComment = await Comment.findOne({
        where: {
          id: parentId,
          postId: postId,
          deletedAt: null
        }
      });

      if (!parentComment) {
        return res.status(404).json({message: '부모 댓글을 찾을 수 없습니다.'});
      }
    }

    let imagePath = null;

    if (imageUrl) {
      // 경로 설정
      const tempFilePath = path.join(process.cwd(), 'public', imageUrl);
      const targetDir = path.join(process.cwd(), 'public', 'uploads', 'comments');

      // 대상 디렉토리 확인 및 생성
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, {recursive: true});
      }
      // 임시 파일이 존재하는지 확인
      if (!fs.existsSync(tempFilePath)) {
        return res.status(400).json({message: '임시 파일이 존재하지 않습니다.'});
      }

      // 새 파일 이름 생성 (중복 방지를 위해 타임스탬프 추가)
      const fileExt = path.extname(imageUrl);
      const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
      const newFilePath = path.join(targetDir, newFileName);

      // 파일 이동
      fs.copyFileSync(tempFilePath, newFilePath);
      fs.unlinkSync(tempFilePath); // 임시 파일 삭제

      imagePath = `/uploads/comments/${newFileName}`;
    }

    // 댓글 생성
    const comment = await Comment.create({
      postId,
      userId: user.id,
      parentId: parentId || null,
      content,
      imageUrl: imagePath || null
    });

    // 생성된 댓글 조회 (사용자 정보 포함)
    const createdComment = await Comment.findOne({
      where: {
        id: comment.id
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickName'],
        }
      ],
      attributes: [
        'id', 'postId', 'userId', 'parentId', 'content', 'imageUrl', 'createdAt', 'updatedAt'
      ]
    });

    // 결과 반환
    return res.status(201).json({
      message: '댓글이 작성되었습니다.',
      comment: createdComment
    });
  } catch (error) {
    console.error('댓글 작성 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}

// 댓글 수정
async function updateComment(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {id, content, imageUrl} = req.body;

  // 필수 필드 확인
  if (!id) {
    return res.status(400).json({message: '댓글 ID가 필요합니다.'});
  }

  if (!content || content.trim() === '') {
    return res.status(400).json({message: '댓글 내용이 필요합니다.'});
  }

  try {
    const user = await User.findOne({
      where: {
        email: session.user.email,
        deletedAt: null // 탈퇴하지 않은 사용자만
      }
    });

    // 댓글 존재 여부 확인
    const comment = await Comment.findOne({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!comment) {
      return res.status(404).json({message: '댓글을 찾을 수 없습니다.'});
    }

    // 권한 확인: 작성자만 수정 가능
    if (comment.userId !== user.id) {
      return res.status(403).json({message: '댓글을 수정할 권한이 없습니다.'});
    }

    // 댓글 수정
    await comment.update({
      content,
      imageUrl: imageUrl || comment.imageUrl
    });

    // 수정된 댓글 조회 (사용자 정보 포함)
    const updatedComment = await Comment.findOne({
      where: {
        id
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickName'],
        }
      ],
      attributes: [
        'id', 'postId', 'userId', 'parentId', 'content', 'imageUrl', 'createdAt', 'updatedAt'
      ]
    });

    // 결과 반환
    return res.status(200).json({
      message: '댓글이 수정되었습니다.',
      comment: updatedComment
    });
  } catch (error) {
    console.error('댓글 수정 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}

// 댓글 삭제
async function deleteComment(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {id} = req.body;

  // 필수 필드 확인
  if (!id) {
    return res.status(400).json({message: '댓글 ID가 필요합니다.'});
  }

  try {
    const user = await User.findOne({
      where: {
        email: session.user.email,
        deletedAt: null // 탈퇴하지 않은 사용자만
      }
    });

    // 댓글 존재 여부 확인
    const comment = await Comment.findOne({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!comment) {
      return res.status(404).json({message: '댓글을 찾을 수 없습니다.'});
    }

    // 권한 확인: 작성자만 삭제 가능
    if (comment.userId !== user.id) {
      return res.status(403).json({message: '댓글을 삭제할 권한이 없습니다.'});
    }

    // 댓글 삭제
    await comment.update({deletedAt: new Date()});

    // 이미지 파일 삭제 (존재하는 경우)
    if (comment.imageUrl) {
      const imagePath = path.join(process.cwd(), 'public', comment.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 결과 반환
    return res.status(200).json({
      message: '댓글이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('댓글 삭제 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}