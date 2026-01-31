import {Board, Post, RedDot} from '../../../models';
import {Op} from 'sequelize';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({message: '허용되지 않는 메소드입니다.'});
  }

  try {
    // 모든 레드닷 설정 조회
    const redDotSettings = await RedDot.findAll();
    const settingsMap = redDotSettings.reduce((acc, curr) => {
      acc[curr.targetKey] = curr.isActive;
      return acc;
    }, {});

    const results = {
      community: false,
      ranking: false
    };

    // 1. 커뮤니티 레드닷 체크
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const count = await Post.count({
      where: {
        createdAt: {
          [Op.gte]: threeDaysAgo
        },
        deletedAt: null
      },
      include: [
        {
          model: Board,
          where: {
            isActive: true,
            deletedAt: null
          },
          required: true
        }
      ]
    });
    results.community = count > 0;

    // 2. 랭킹 레드닷 체크
    if (settingsMap['ranking']) {
      results.ranking = true;
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('레드닷 확인 중 오류 발생:', error);
    return res.status(500).json({message: '서버 오류가 발생했습니다.'});
  }
}
