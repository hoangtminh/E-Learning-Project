import { io } from 'socket.io-client';

const SOCKET_BASE_URL = 'http://localhost:3001';

const socketOptions = {
  autoConnect: false,
  withCredentials: true,
};

// Chat specific socket
export const chatSocket = io(`${SOCKET_BASE_URL}/chat`, socketOptions);

// Notification specific socket
export const notificationSocket = io(
  `${SOCKET_BASE_URL}/notification`,
  socketOptions,
);

// WebRTC / Call specific socket (using namespace)
export const callSocket = io(`${SOCKET_BASE_URL}/webrtc`, socketOptions);

// Legacy reference if needed, defaults to chat
export const socket = chatSocket;
