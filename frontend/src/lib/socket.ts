import { io } from 'socket.io-client';

const getSocketBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
};

const SOCKET_BASE_URL = getSocketBaseUrl();

const socketOptions = {
  path: '/api/socket.io',
  autoConnect: false,
  withCredentials: true,
  transports: ['polling'],
  upgrade: false,
  forceNew: true,
};

// Chat specific socket
export const chatSocket = io(SOCKET_BASE_URL, socketOptions);

// Notification specific socket
export const notificationSocket = io(SOCKET_BASE_URL, socketOptions);

// WebRTC / call signaling socket
export const callSocket = io(SOCKET_BASE_URL, socketOptions);

// Legacy reference if needed, defaults to chat
export const socket = chatSocket;
