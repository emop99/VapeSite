import { ChatLog } from '../../../models';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const history = await ChatLog.findAll({
      limit: 50,
      order: [['createdAt', 'DESC']],
    });

    // 결과를 시간순으로 정렬 (가장 최근이 아래로 오게)
    return res.status(200).json(history.reverse());
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
