const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const socketIo = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

// 활성 소켓 연결을 저장하는 맵 (유저 ID -> 소켓 ID 배열)
const userSocketMap = new Map();
// 소켓 ID를 유저 ID에 매핑하는 맵 (소켓 ID -> 유저 ID)
const socketUserMap = new Map();
const GLOBAL_CHAT_ROOM = 'global_chat'; // 모든 유저를 포함하는 채팅방 이름

app.prepare().then(() => {
  const { ChatLog } = require('./models');
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
  ].filter(Boolean);

  const io = socketIo(server, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : false,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.io 이벤트 핸들러 설정
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // 사용자 인증 및 소켓 매핑
    socket.on('authenticate', (userId) => {
      if (!userId) return;

      // 소켓 ID를 유저 ID에 매핑
      socketUserMap.set(socket.id, userId);

      // 유저 ID에 소켓 ID 추가
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, []);
      }
      userSocketMap.get(userId).push(socket.id);

      console.log(`User ${userId} authenticated with socket ${socket.id}`);
    });

    // 전체 채팅방 입장
    socket.on('join_chat', () => {
      socket.join(GLOBAL_CHAT_ROOM);

      // 익명 유저인 경우 닉네임 할당 (고유 번호 포함)
      if (!socket.guestNickname) {
        const guestNumber = Math.floor(1000 + Math.random() * 9000);
        socket.guestNickname = `익명_${guestNumber}`;
      }
      socket.emit('set_nickname', socket.guestNickname);

      console.log(`Socket ${socket.id} joined global chat`);
    });

    // 채팅 메시지 전송
    socket.on('send_message', async (data) => {
      let { userId, nickName, message } = data;
      const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

      if (!message || message.trim() === '') return;

      // 익명 유저인 경우 서버에서 할당한 닉네임 사용
      if (!userId) {
        nickName = socket.guestNickname || '익명';
      }

      try {
        // DB에 저장
        const chatEntry = await ChatLog.create({
          userId: userId || null,
          nickName: nickName,
          message: message,
          ip: clientIp
        });

        // 모든 유저에게 브로드캐스트
        io.to(GLOBAL_CHAT_ROOM).emit('receive_message', {
          id: chatEntry.id,
          userId: chatEntry.userId,
          nickName: chatEntry.nickName,
          message: chatEntry.message,
          createdAt: chatEntry.createdAt
        });
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    });

    // 연결 해제 시 매핑 제거
    socket.on('disconnect', () => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        // 유저의 소켓 목록에서 현재 소켓 제거
        const userSockets = userSocketMap.get(userId) || [];
        const updatedSockets = userSockets.filter(id => id !== socket.id);

        if (updatedSockets.length > 0) {
          userSocketMap.set(userId, updatedSockets);
        } else {
          userSocketMap.delete(userId);
        }

        // 소켓-유저 매핑에서 제거
        socketUserMap.delete(socket.id);
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  // 알림 전송 함수 (전역으로 노출)
  global.sendNotification = (userId, notification) => {
    const userSockets = userSocketMap.get(userId);
    if (userSockets && userSockets.length > 0) {
      userSockets.forEach(socketId => {
        io.to(socketId).emit('notification', notification);
      });
      return true;
    }
    return false;
  };

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