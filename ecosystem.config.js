module.exports = {
  apps: [
    {
      // 애플리케이션 이름 (PM2에서 사용할 이름)
      // PM2 명령어에서 이 이름을 사용하여 애플리케이션을 제어합니다.
      name: "juicegoblin",

      // 실행할 스크립트 파일 경로
      // Node.js 파일뿐만 아니라, Bash, Python 등 다른 스크립트도 실행 가능합니다.
      script: "./server.js",

      // 현재 작업 디렉토리 (기본값: 현재 디렉토리)z
      // 애플리케이션 실행 기준이 되는 경로를 지정합니다.
      // cwd: "/var/www/VapeSIte",

      // 실행 모드: "fork" 또는 "cluster"
      // fork: 단일 프로세스 실행
      // cluster: 멀티 코어를 활용하여 여러 프로세스 실행
      exec_mode: "fork",

      // 실행할 인스턴스 수
      // cluster 모드에서만 유효하며, "max"로 설정하면 모든 CPU 코어를 사용합니다.
      instances: "1",

      // 애플리케이션에 전달할 인수
      // 실행 시 커맨드라인 인수로 전달됩니다.
      args: "start",

      // 기본 환경 변수 설정
      // NODE_ENV, PORT 등 실행 환경을 정의합니다.
      env: {
        NODE_ENV: "production",
      //   NODE_ENV: "development", // 개발 환경
        PORT: 3000              // 기본 포트
      },

      // 프로덕션 환경에서 사용할 환경 변수 설정
      // "pm2 start ecosystem.config.js --env production"으로 실행 시 적용됩니다.
      // env_production: {
      //   NODE_ENV: "production", // 프로덕션 환경
      //   PORT: 8000              // 프로덕션 포트
      // },

      // 로그 파일 경로 설정 (표준 출력과 에러 로그 통합)
      // log_file: "/var/logs/my-app-combined.log",

      // 표준 출력 로그 파일 경로
      // out_file: "/var/logs/my-app-out.log",

      // 에러 로그 파일 경로
      // error_file: "/var/logs/my-app-error.log",

      // 파일 변경 감지 (기본값: false)
      // true로 설정하면 파일 변경 시 애플리케이션을 자동으로 재시작합니다.
      // watch: true,

      // 감시에서 제외할 파일/폴더 (watch가 true일 때 유효)
      // ignore_watch: ["node_modules", "logs"],

      // 자동 재시작 여부 (기본값: true)
      // false로 설정하면 애플리케이션이 종료된 상태로 유지됩니다.
      autorestart: true,

      // 재시작 시도 횟수 (기본값: 무제한)
      // 특정 횟수 이상 실패하면 프로세스를 종료합니다.
      // max_restarts: 10,

      // 최대 메모리 사용량 (기본값: 제한 없음)
      // 프로세스가 이 메모리 제한을 초과하면 재시작합니다.
      // max_memory_restart: "300M",

      // 개발 중 디버깅을 위한 상세 로그 활성화 (기본값: false)
      // true로 설정하면 애플리케이션 디버그 로그를 더 많이 출력합니다.
      // debug: false,

      // 실행 중인 프로세스의 CPU/메모리 사용량을 확인할 주기 (기본값: 10초)
      // PM2 Dashboard와 같은 모니터링 도구에서 사용됩니다.
      // min_uptime: "1m",   // 최소 실행 시간 (프로세스가 이 시간 이전에 종료되면 비정상으로 간주)
      // max_uptime: "24h",  // 최대 실행 시간 (이 시간이 지나면 프로세스를 재시작)

      // 사용자 정의 스크립트를 애플리케이션 실행 후 실행
      // post_start_script: "./scripts/postStart.sh"

      // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합침
      merge_logs: true,

      // 무중단 배포를 위한 추가 설정
      wait_ready: true,           // 프로세스가 'ready' 시그널을 보낼 때까지 대기
      listen_timeout: 50000,      // ready 시그널 대기 시간 (ms)
      kill_timeout: 5000,         // 이전 프로세스 종료 전 대기 시간 (ms)
      max_memory_restart: "1G",   // 메모리 제한 설정
      restart_delay: 3000         // 재시작 간 지연 시간 (ms)

    }
  ]
};