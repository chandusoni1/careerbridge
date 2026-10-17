const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../utils/logger');

let ioInstance = null;
const onlineUsers = new Map(); // userId -> Set of socketIds
const socketUserMap = new Map(); // socketId -> userId

const isUserOnline = (userId) => {
  if (!userId) return false;
  const idStr = userId.toString();
  return onlineUsers.has(idStr) && onlineUsers.get(idStr).size > 0;
};

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`⚡ Socket Connected: ${socket.id}`);

    socket.on('join_chat', (userId) => {
      if (!userId) return;
      const idStr = userId.toString();
      socket.join(idStr);
      socketUserMap.set(socket.id, idStr);

      if (!onlineUsers.has(idStr)) {
        onlineUsers.set(idStr, new Set());
      }
      onlineUsers.get(idStr).add(socket.id);

      // Notify clients of online status
      io.emit('user_presence', { userId: idStr, isOnline: true });
      logger.debug(`User ${idStr} joined personal socket room`);
    });

    socket.on('send_message', (data) => {
      if (data && data.receiverId) {
        io.to(data.receiverId.toString()).emit('receive_message', data);
        io.to(data.receiverId.toString()).emit('notification', {
          type: 'message',
          msg: `${data.senderName || 'Someone'} sent you a message!`,
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`❌ Socket Disconnected: ${socket.id}`);
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        socketUserMap.delete(socket.id);
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);
            // Update lastSeen in database
            const User = require('../modules/users/user.model');
            User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(() => {});
            io.emit('user_presence', {
              userId,
              isOnline: false,
              lastSeen: new Date(),
            });
          }
        }
      }
    });
  });

  ioInstance = io;
  return io;
};

const getIo = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
};

module.exports = {
  initSocket,
  getIo,
  isUserOnline,
};
