import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/** Lazily creates (or returns) the shared Socket.IO connection and joins the user's private room. */
export function getSocket(userId?: string): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: true,
    });
  }
  if (userId) {
    socket.emit('join', userId);
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
