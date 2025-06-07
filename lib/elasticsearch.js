const {Client} = require('@elastic/elasticsearch');

// Elasticsearch 클라이언트 인스턴스 생성
const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: false
});

// Elasticsearch 연결 확인 함수
const checkConnection = async () => {
  try {
    const info = await elasticClient.info();
    console.log(`Elasticsearch 연결 성공: ${info.cluster_name}`);
    return true;
  } catch (error) {
    console.error('Elasticsearch 연결 실패:', error);
    return false;
  }
};

// 인덱스 매핑 확인 함수
const checkIndexMapping = async (index) => {
  try {
    const mapping = await elasticClient.indices.getMapping({
      index
    });
    return mapping[index].mappings.properties;
  } catch (error) {
    console.error(`엘라스틱 서치 인덱스 매핑 확인 실패: ${error.message}`);
    return null;
  }
};

// 크롤링 데이터 검색
const searchCrawlerLogs = async ({
                                   index = 'vape_logs',
                                   from = 0,
                                   size = 10,
                                   sort = {'@timestamp': 'desc'},
                                   query = {match_all: {}},
                                   timeRange = null
                                 }) => {
  // 쿼리 구성
  const searchQuery = {query};

  // 시간 범위 필터 추가
  if (timeRange) {
    searchQuery.query = {
      bool: {
        must: [query],
        filter: [
          {
            range: {
              '@timestamp': timeRange
            }
          }
        ]
      }
    };
  }

  try {
    // 먼저 인덱스가 존재하는지 확인
    const indexExists = await elasticClient.indices.exists({
      index
    });

    // ES 9.0+에서는 직접 불리언 값 반환
    if (!indexExists) {
      console.warn(`인덱스 '${index}'가 존재하지 않습니다.`);
      return {total: 0, hits: []};
    }

    // 정렬 옵션 구성
    let sortOption;
    try {
      const mapping = await checkIndexMapping(index);
      const sortField = Object.keys(sort)[0];

      if (mapping && mapping[sortField]) {
        sortOption = Object.entries(sort).map(([field, order]) => ({[field]: {order}}));
      } else if (mapping && mapping[sortField + '.keyword']) {
        // 키워드 필드로 정렬 시도
        sortOption = [{[sortField + '.keyword']: {order: Object.values(sort)[0]}}];
      } else {
        console.warn(`정렬 필드 '${sortField}'에 대한 매핑이 없어 정렬 없이 검색합니다.`);
        sortOption = undefined;
      }
    } catch (mappingError) {
      console.warn('매핑 확인 실패, 정렬 없이 검색합니다:', mappingError.message);
      sortOption = undefined;
    }

    // ES 9.0+ 형식의 검색 실행 (파라미터가 최상위 레벨로 이동)
    const response = await elasticClient.search({
      index,
      from,
      size,
      sort: sortOption,
      ...searchQuery // 쿼리를 최상위로 펼침
    });

    // ES 9.0+에서는 response 객체에 직접 접근
    return {
      total: response.hits.total.value || 0,
      hits: response.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source
      }))
    };
  } catch (error) {
    console.error('Elasticsearch 검색 오류:', error);
    return {total: 0, hits: [], error: error.message};
  }
};

// 크롤러별 통계 집계
const aggregateCrawlerStats = async ({
                                       index = 'vape_logs',
                                       timeRange = null
                                     }) => {
  // 집계 쿼리 구성
  const searchQuery = {
    aggs: {
      crawler_stats: {
        terms: {
          field: 'crawler_name.keyword',
          size: 20
        },
        aggs: {
          success_count: {
            filter: {
              term: {'status.keyword': 'success'}
            }
          },
          error_count: {
            filter: {
              term: {'status.keyword': 'error'}
            }
          },
          avg_duration: {
            avg: {
              field: 'duration'
            }
          }
        }
      }
    },
    size: 0
  };

  // 시간 범위 필터 추가
  if (timeRange) {
    searchQuery.query = {
      bool: {
        filter: [
          {
            range: {
              '@timestamp': timeRange
            }
          }
        ]
      }
    };
  }

  try {
    // 인덱스 존재 여부 확인
    const indexExists = await elasticClient.indices.exists({
      index
    });

    // ES 9.0+에서는 직접 불리언 값 반환
    if (!indexExists) {
      console.warn(`인덱스 '${index}'가 존재하지 않습니다.`);
      return [];
    }

    // ES 9.0+ 형식의 검색 실행 (body를 최상위 레벨로 펼침)
    const response = await elasticClient.search({
      index,
      ...searchQuery
    });

    // ES 9.0+에서는 response 객체에 직접 접근
    if (!response.aggregations || !response.aggregations.crawler_stats) {
      return [];
    }

    return response.aggregations.crawler_stats.buckets.map(bucket => ({
      crawler_name: bucket.key,
      total: bucket.doc_count,
      success: bucket.success_count.doc_count,
      error: bucket.error_count.doc_count,
      avg_duration: Math.round(bucket.avg_duration.value || 0)
    }));
  } catch (error) {
    console.error('Elasticsearch 집계 오류:', error);
    return [];
  }
};

// 최근 크롤링 오류 조회
const getRecentErrors = async ({
                                 index = 'vape_logs',
                                 size = 5
                               }) => {
  try {
    // 인덱스 존재 여부 확인
    const indexExists = await elasticClient.indices.exists({
      index
    });

    // ES 9.0+에서는 직접 불리언 값 반환
    if (!indexExists) {
      console.warn(`인덱스 '${index}'가 존재하지 않습니다.`);
      return [];
    }

    // 쿼리 구성
    const searchQuery = {
      query: {
        term: {'status.keyword': 'error'}
      }
    };

    // 정렬 설정 구성
    let sortOption;
    try {
      const mapping = await checkIndexMapping(index);
      if (mapping && mapping['@timestamp']) {
        sortOption = [{'@timestamp': {order: 'desc'}}];
      } else if (mapping && mapping['created_at']) {
        sortOption = [{'created_at': {order: 'desc'}}];
      } else {
        console.warn('시간 관련 필드 매핑이 없어 정렬 없이 검색합니다.');
      }
    } catch (mappingError) {
      console.warn('매핑 확인 실패, 정렬 없이 검색합니다:', mappingError.message);
    }

    // ES 9.0+ 형식으로 검색 실행
    const response = await elasticClient.search({
      index,
      size,
      sort: sortOption,
      ...searchQuery
    });

    // ES 9.0+에서는 response 객체에 직접 접근
    return response.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));
  } catch (error) {
    console.error('Elasticsearch 오류 조회 실패:', error);
    return [];
  }
};

module.exports = {
  elasticClient,
  checkConnection,
  checkIndexMapping,
  searchCrawlerLogs,
  aggregateCrawlerStats,
  getRecentErrors
};
