import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  placed: "Order placed",
  accepted: "Order accepted",
  cooking: "Cooking in progress",
  ready: "Ready for pickup",
  assigned: "Driver assigned",
  delivered: "Delivered",
};

export function useSocketInvalidation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      console.warn("[useSocketInvalidation] Socket not initialized — skipping event binding");
      return;
    }

    const onStatusChanged = (data: { orderId: number; status: string }) => {
      if (!socket.connected) {
        console.warn("[useSocketInvalidation] Received event on disconnected socket");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/orders", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/my-orders"] });

      if (user?.role === "customer") {
        const label = STATUS_LABELS[data.status] || data.status;
        toast.info(label, { description: `Order #${data.orderId}` });
      }
    };

    const onCreated = (data: { id: number; customerName: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });

      if (user?.role === "restaurant") {
        toast("New order received!", {
          description: data?.customerName ? `From ${data.customerName}` : "Check the board",
        });
      }
    };

    const onAccepted = (data: { orderId: number; driverName: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", data.orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/my-orders"] });

      if (user?.role === "driver") {
        toast.info("Order assigned", { description: `Order #${data.orderId}` });
      }
    };

    socket.on("order:status_changed", onStatusChanged);
    socket.on("order:created", onCreated);
    socket.on("order:accepted", onAccepted);

    return () => {
      socket.off("order:status_changed", onStatusChanged);
      socket.off("order:created", onCreated);
      socket.off("order:accepted", onAccepted);
    };
  }, [queryClient, user?.role]);
}
