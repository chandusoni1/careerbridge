import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000';

let socket = null;
let currentJoinedUserId = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      if (currentJoinedUserId) {
        socket.emit('join_chat', currentJoinedUserId);
      }
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  if (!userId) return null;
  const s = getSocket();
  currentJoinedUserId = userId.toString();

  if (!s.connected) {
    s.connect();
  } else {
    s.emit('join_chat', currentJoinedUserId);
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    currentJoinedUserId = null;
    socket.disconnect();
  }
};

export default {
  getSocket,
  connectSocket,
  disconnectSocket,
};
