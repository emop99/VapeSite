// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);

    // PM2에게 애플리케이션이 준비되었음을 알림
    if (process.send) {
      process.send('ready');
    }
  });

  // 종료 시그널 처리
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Graceful shutdown...');
    server.close(() => {
      console.log('Server closed. Process exiting...');
      process.exit(0);
    });
  });
});