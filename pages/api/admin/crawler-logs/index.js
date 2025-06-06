import {withAdminAuth} from '../../../../utils/adminAuth';
import {searchCrawlerLogs} from '../../../../lib/elasticsearch';

async function crawlerLogsHandler(req, res) {
  switch (req.method) {
    case 'GET':
      return getCrawlerLogs(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({success: false, message: `Method ${req.method} Not Allowed`});
  }
}

async function getCrawlerLogs(req, res) {
  try {
    // 쿼리 파라미터 추출
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const level = req.query.level || ''; // 로그 레벨 (INFO, ERROR 등)
    const loggerName = req.query.logger || ''; // logger_name
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';

    // 검색 쿼리 구성
    let query = {match_all: {}};
    const filterClauses = [];

    // 로그 레벨로 필터링
    if (level) {
      filterClauses.push({
        term: {'level': level}
      });
    }

    // 로거 이름으로 필터링
    if (loggerName) {
      filterClauses.push({
        term: {'logger_name': loggerName}
      });
    }

    // 메시지 검색 추가
    const message = req.query.message || '';
    if (message) {
      filterClauses.push({
        match: {'message': message}
      });
    }

    // 시간 범위 필터링
    const timeRange = {};
    if (startDate) {
      timeRange.gte = new Date(startDate).toISOString();
    }
    if (endDate) {
      // endDate에 하루를 더해 해당 일자까지 포함
      const endDateObj = new Date(endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      timeRange.lte = endDateObj.toISOString();
    }

    // 쿼리 빌드
    if (filterClauses.length > 0 || Object.keys(timeRange).length > 0) {
      query = {
        bool: {
          filter: filterClauses
        }
      };

      if (Object.keys(timeRange).length > 0) {
        if (!query.bool) {
          query.bool = {};
        }
        if (!query.bool.filter) {
          query.bool.filter = [];
        }
        query.bool.filter.push({
          range: {
            timestamp: timeRange
          }
        });
      }
    }

    // Elasticsearch에서 로그 검색
    const result = await searchCrawlerLogs({
      index: 'vape_logs',
      from,
      size: limit,
      query,
      sort: {timestamp: 'desc'}
    });

    return res.status(200).json({
      success: true,
      data: {
        logs: result.hits,
        pagination: {
          totalCount: result.total,
          totalPages: Math.ceil(result.total / limit),
          currentPage: page
        }
      }
    });
  } catch (error) {
    console.error('크롤러 로그 조회 실패:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
}

export default withAdminAuth(crawlerLogsHandler);
