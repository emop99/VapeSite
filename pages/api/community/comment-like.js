import {getServerSession} from 'next-auth/next';
import {Comment, Like, Notification, NotificationSettings, Post, User} from '../../../models';
import {sendRealTimeNotification} from "../../../lib/notifications";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({message: '허용되지 않는 메서드입니다.'});
  }

  const session = await getServerSession(req, res);
  if (!session || !session.user) {
    return res.status(401).json({message: '로그인이 필요합니다.'});
  }

  const {commentId, action} = req.body;
  if (!commentId || !['like', 'unlike'].includes(action)) {
    return res.status(400).json({message: '잘못된 요청입니다.'});
  }

  try {
    // 사용자 정보 조회
    const user = await User.findOne({
      where: {email: session.user.email, deletedAt: null}
    });
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    // 댓글 존재 확인 (작성자 정보 포함)
    const comment = await Comment.findOne({
      where: {id: commentId},
      include: [
        {
          model: Post,
          attributes: ['id']
        }
      ]
    });
    if (!comment) {
      return res.status(404).json({message: '댓글을 찾을 수 없습니다.'});
    }

    const likeWhere = {
      userId: user.id,
      targetType: 'comment',
      targetId: commentId
    };

    if (action === 'like') {
      // 이미 좋아요가 있으면 무시
      const [like, created] = await Like.findOrCreate({where: likeWhere});

      // 새로 좋아요가 생성된 경우에만 알림 생성
      if (created) {
        try {
          // 자신의 댓글에 좋아요를 누른 경우는 알림 생성하지 않음
          if (comment.userId !== user.id) {
            // 댓글 작성자의 알림 설정 확인
            const authorSettings = await NotificationSettings.findOne({
              where: {userId: comment.userId}
            });

            // 알림 설정이 없거나 좋아요 알림이 활성화된 경우
            if (!authorSettings || authorSettings.likeEnabled) {
              // 알림 생성
              const notificationContent = `${user.nickName}님이 회원님의 댓글을 좋아합니다.`;
              await Notification.create({
                userId: comment.userId,
                senderId: user.id,
                type: 'like',
                postId: comment.Post.id,
                commentId: comment.id,
                content: notificationContent,
                url: `/community/post/${comment.Post.id}#comment-${comment.id}`,
                isRead: false
              });

              // 실시간 소켓 알림 전송
              try {
                const sendResult = sendRealTimeNotification(comment.userId, {
                  type: 'like',
                  content: notificationContent,
                  url: `/community/post/${comment.Post.id}#comment-${comment.id}`,
                });

                if (!sendResult) {
                  // WebPush 처리
                  try {
                    fetch(`${process.env.NEXTAUTH_URL}/api/notifications/push/send`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.INTERNAL_API_KEY
                      },
                      body: JSON.stringify({
                        userId: comment.userId,
                        notification: {
                          title: '댓글 좋아요 알림',
                          body: notificationContent,
                          url: `/community/post/${comment.Post.id}#comment-${comment.id}`,
                          icon: '/icons/icon-192x192.png'
                        }
                      })
                    });
                  } catch (webPushError) {
                    console.error('WebPush 알림 전송 오류:', webPushError);
                  }
                }
              } catch (emitError) {
                console.error('소켓 알림 전송 오류:', emitError);
                // 소켓 알림 전송이 실패한 경우에도 WebPush 처리
                try {
                  const webPushResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/notifications/push/send`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-api-key': process.env.INTERNAL_API_KEY
                    },
                    body: JSON.stringify({
                      userId: comment.userId,
                      notification: {
                        title: '댓글 좋아요 알림',
                        body: notificationContent,
                        url: `/community/post/${comment.Post.id}#comment-${comment.id}`,
                        icon: '/icons/icon-192x192.png'
                      }
                    })
                  });

                  if (!webPushResponse.ok) {
                    console.error('WebPush 알림 전송 실패:', await webPushResponse.text());
                  }
                } catch (webPushError) {
                  console.error('WebPush 알림 전송 오류:', webPushError);
                }
              }
            }
          }
        } catch (notificationError) {
          // 알림 생성 실패해도 좋아요 처리는 성공으로 처리
          console.error('알림 생성 중 오류 발생:', notificationError);
        }
      }
    } else if (action === 'unlike') {
      await Like.destroy({where: likeWhere});
    }

    // 최신 좋아요 수와 내 좋아요 여부 반환
    const likeCount = await Like.count({
      where: {targetType: 'comment', targetId: commentId}
    });
    const likedByUser = !!(await Like.findOne({where: likeWhere}));

    return res.status(200).json({likeCount, likedByUser});
  } catch (error) {
    console.error('댓글 좋아요 처리 오류:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}
