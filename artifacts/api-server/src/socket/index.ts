import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../lib/logger";

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    path: "/ws/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Client connected");

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Client disconnected");
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function emitOrderCreated(order: { id: number; customerName: string; restaurantId: number; status: string; total: number }): void {
  if (!io) return;
  io.emit("order:created", order);
}

export function emitOrderStatusChanged(orderId: number, status: string): void {
  if (!io) return;
  io.emit("order:status_changed", { orderId, status });
}

export function emitOrderAccepted(orderId: number, driverName: string): void {
  if (!io) return;
  io.emit("order:accepted", { orderId, driverName });
}
