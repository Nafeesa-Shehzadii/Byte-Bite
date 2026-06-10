import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation, MapPin, Package, AlertCircle } from "lucide-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { DriverStats } from "@/components/dashboard/driver-stats";

export default function DriverDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: availableOrders, isLoading: availLoading } = useQuery<any[]>({
    queryKey: ["/api/drivers/available"],
    queryFn: async () => {
      const res = await fetch("/api/drivers/available");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const { data: myOrders, isLoading: myLoading } = useQuery<any[]>({
    queryKey: ["/api/drivers/my-orders"],
    queryFn: async () => {
      const res = await fetch("/api/drivers/my-orders");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 3000,
  });

  const acceptOrder = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/drivers/${orderId}/accept`, { method: "PATCH" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to accept");
      }
      return res.json();
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/my-orders"] });
      toast.success("Pickup accepted!", { description: `Order #${orderId}` });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deliverOrder = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/my-orders"] });
      toast.success("Delivery completed!", { description: `Order #${orderId}` });
    },
  });

  if (availLoading || myLoading) {
    return (
      <div className="container mx-auto px-4 space-y-6 max-w-4xl py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 bg-[#111111] rounded-2xl border border-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-[#111111] rounded-lg" />
            <Skeleton className="h-4 w-32 bg-[#111111] rounded" />
          </div>
        </div>
        <Skeleton className="h-6 w-40 bg-[#111111] rounded-lg" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-44 w-full bg-[#111111] rounded-3xl border border-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  const activeMyOrders = myOrders?.filter(o => o.status !== "delivered") || [];

  return (
    <div className="container mx-auto px-4 space-y-10 sm:space-y-12 max-w-4xl pb-20 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(230,57,70,0.15)]">
            <Navigation className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Driver Terminal</h1>
            <p className="text-zinc-400 font-mono mt-1 text-sm sm:text-base">Callsign: <span className="text-primary font-bold">{user?.name}</span></p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <DriverStats orders={myOrders || []} />

      {activeMyOrders.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-primary flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B6B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Active Assignment
          </h2>
          <AnimatePresence>
            {activeMyOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#111111] backdrop-blur-2xl border border-primary/30 shadow-[0_0_40px_rgba(230,57,70,0.1)] rounded-3xl p-5 sm:p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-primary text-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-black uppercase tracking-wider rounded-bl-2xl shadow-lg">
                  {order.status}
                </div>

                <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-0">
                  <div className="pr-20 sm:pr-24">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{order.restaurantName}</h3>
                    <div className="flex items-start gap-2 text-zinc-300">
                      <MapPin className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                      <p className="text-base sm:text-lg leading-tight">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-lg font-bold text-white">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Order Total</p>
                      <p className="text-lg font-mono font-bold text-primary">${(order.total / 100).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {order.items.reduce((acc: number, i: any) => acc + i.quantity, 0)} items to deliver
                    </div>
                    {order.status === "ready" ? (
                      <Button
                        size="lg"
                        onClick={() => deliverOrder.mutate(order.id)}
                        disabled={deliverOrder.isPending}
                        className="w-full sm:w-auto bg-[#2EC4B6] text-[#0A0A0A] hover:bg-[#20a498] font-bold text-lg px-8 shadow-[0_0_20px_rgba(46,196,182,0.4)]"
                      >
                        Complete Delivery
                      </Button>
                    ) : (
                      <Button disabled size="lg" className="w-full sm:w-auto bg-[#0A0A0A] text-zinc-500 border border-white/10 font-bold">
                        Awaiting Kitchen...
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-white">Available Pickups</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          <AnimatePresence>
            {availableOrders?.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#111111] backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:bg-[#111111]/80 transition-all rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 shadow-xl group"
              >
                <div className="space-y-2 sm:space-y-3 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-xl sm:text-2xl text-white group-hover:text-primary transition-colors truncate">{order.restaurantName}</h3>
                    <span className="font-mono text-sm bg-white/5 text-zinc-400 px-2 py-1 rounded shrink-0">#{order.id}</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-300">
                    <MapPin className="w-4 h-4 shrink-0 text-primary mt-1" />
                    <p className="leading-tight text-sm sm:text-base">{order.deliveryAddress}</p>
                  </div>
                  <div className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                    <Package className="w-4 h-4" /> {order.items.reduce((acc: number, i: any) => acc + i.quantity, 0)} items - ${(order.total / 100).toFixed(2)}
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => acceptOrder.mutate(order.id)}
                  disabled={acceptOrder.isPending}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-primary hover:text-white hover:border-primary transition-all shrink-0 font-bold px-6 sm:px-8 py-5 sm:py-6 text-base shadow-lg w-full sm:w-auto"
                >
                  Accept Pickup
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {(!availableOrders || availableOrders.length === 0) && (
            <div className="text-center py-16 sm:py-20 px-4 border-2 border-dashed border-white/5 rounded-3xl bg-[#111111]/50">
              <AlertCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-lg font-bold text-zinc-500">No pickups available</p>
              <p className="text-zinc-600 mt-1">Stand by — new orders will appear here in real time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
