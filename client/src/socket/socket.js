import { io } from "socket.io-client";

const SOCKET_URL = "http://10.96.252.46:5001";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
  transports: ["websocket", "polling"],
});

export default socket;