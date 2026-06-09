import { io } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";

let socket: ReturnType<typeof io> | null = null;

export const initSocket = (queryClient: QueryClient) => {
  if (socket) return socket;

  socket = io({ path: "/ws/socket.io" });

  socket.on("order:created", () => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders/available"] });
  });

  socket.on("order:status_changed", () => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
  });

  socket.on("order:accepted", () => {
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders/available"] });
  });

  return socket;
};
