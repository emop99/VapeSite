import {Board, Post, User} from '../../../../models';
import {getServerSession} from 'next-auth/next';

export default async function handler(req, res) {
  // 요청 메소드에 따라 처리
  if (req.method === 'GET') {
    return getPost(req, res);
  } else if (req.method === 'PUT') {
    return updatePost(req, res);
  } else if (req.method === 'DELETE') {
    return deletePost(req, res);
  } else {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }
}

// 게시글 조회 (이미 구현됨)
async function getPost(req, res) {
  const {id} = req.query;

  if (!id) {
    return res.status(400).json({message: '게시글 ID가 필요합니다.'});
  }

  try {
    // 게시글 조회
    const post = await Post.findOne({
      where: {
        id: id,
        deletedAt: null
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

    // 게시글이 없는 경우
    if (!post) {
      return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    }

    // 조회수 증가
    await post.increment('viewCount', {by: 1});

    // 게시글 정보 반환
    return res.status(200).json({post});
  } catch (error) {
    console.error('게시글 조회 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}

// 게시글 수정
async function updatePost(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {id} = req.query;
  const {title, content, isNotice = false} = req.body;

  if (!id) {
    return res.status(400).json({message: '게시글 ID가 필요합니다.'});
  }

  // 필수 필드 확인
  if (!title || title.trim() === '') {
    return res.status(400).json({message: '제목이 필요합니다.'});
  }

  if (!content || content.trim() === '') {
    return res.status(400).json({message: '내용이 필요합니다.'});
  }

  try {
    // 게시글 조회
    const post = await Post.findOne({
      where: {
        id: id,
        deletedAt: null
      },
      include: [
        {
          model: User,
          attributes: ['id', 'nickName'],
        }
      ]
    });

    // 게시글이 없는 경우
    if (!post) {
      return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    }

    const user = await User.findOne({
      where: {
        email: session.user.email,
        deletedAt: null // 탈퇴하지 않은 사용자만
      }
    });

    // 사용자 정보가 없는 경우
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 권한 확인: 관리자이거나 작성자만 수정 가능
    if (user.grade !== 'ADMIN' && post.userId !== user.id) {
      return res.status(403).json({message: '게시글을 수정할 권한이 없습니다.'});
    }

    // 공지사항 권한 확인 (관리자만 가능)
    if (isNotice && user.grade !== 'ADMIN') {
      return res.status(403).json({message: '공지사항 설정 권한이 없습니다.'});
    }

    // 게시글 수정
    const updateData = {
      title,
      content
    };

    // 관리자인 경우에만 공지사항 상태 변경 가능
    if (user.grade !== 'ADMIN') {
      updateData.isNotice = isNotice;
    }

    await post.update(updateData);

    // 수정된 게시글 조회
    const updatedPost = await Post.findOne({
      where: {
        id: id
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
    return res.status(200).json({
      message: '게시글이 수정되었습니다.',
      post: updatedPost
    });
  } catch (error) {
    console.error('게시글 수정 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}

// 게시글 삭제 (소프트 삭제)
async function deletePost(req, res) {
  // 사용자 인증 확인
  const session = await getServerSession(req, res);
  if (!session) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {id} = req.query;

  if (!id) {
    return res.status(400).json({message: '게시글 ID가 필요합니다.'});
  }

  try {
    // 게시글 조회
    const post = await Post.findOne({
      where: {
        id: id,
        deletedAt: null
      }
    });

    // 게시글이 없는 경우
    if (!post) {
      return res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    }

    const user = await User.findOne({
      where: {
        email: session.user.email,
        deletedAt: null // 탈퇴하지 않은 사용자만
      }
    });

    // 사용자 정보가 없는 경우
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 권한 확인: 관리자이거나 작성자만 삭제 가능
    if (user.grade !== 'ADMIN' && post.userId !== user.id) {
      return res.status(403).json({message: '게시글을 삭제할 권한이 없습니다.'});
    }

    // 게시글 소프트 삭제
    await post.update({
      deletedAt: new Date()
    });

    // 결과 반환
    return res.status(200).json({
      message: '게시글이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('게시글 삭제 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}