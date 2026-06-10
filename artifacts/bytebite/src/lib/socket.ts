import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initSocket(): Socket {
  if (socket) return socket;
  socket = io({ path: "/ws/socket.io" });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}
