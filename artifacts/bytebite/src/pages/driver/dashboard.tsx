import { useListAvailableOrders, useListDriverOrders, useAcceptOrder, useUpdateOrderStatus } from "@workspace/api-client-react";
import { useAppStore } from "@/hooks/use-store";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation, MapPin, Package, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function DriverDashboard() {
  const { driverName } = useAppStore();
  const { data: availableOrders, isLoading: availLoading } = useListAvailableOrders({ query: { refetchInterval: 3000 }});
  const { data: myOrders, isLoading: myLoading } = useListDriverOrders({ driverName }, { query: { enabled: !!driverName, refetchInterval: 3000 }});
  
  const acceptOrder = useAcceptOrder();
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const handleAccept = async (orderId: number) => {
    if (!driverName) return;
    await acceptOrder.mutateAsync({ orderId, data: { driverName } });
    queryClient.invalidateQueries({ queryKey: ["/api/orders/available"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders", { driverName }] });
  };

  const handleDeliver = async (orderId: number) => {
    await updateStatus.mutateAsync({ id: orderId, data: { status: 'delivered' } });
    queryClient.invalidateQueries({ queryKey: ["/api/orders", { driverName }] });
  };

  if (availLoading || myLoading) {
    return <div className="space-y-6 max-w-4xl mx-auto">
      {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-3xl border border-white/10" />)}
    </div>;
  }

  const activeMyOrders = myOrders?.filter(o => o.status !== 'delivered') || [];

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <Navigation className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Driver Terminal</h1>
            <p className="text-zinc-400 font-mono mt-1">Callsign: <span className="text-amber-500 font-bold">{driverName}</span></p>
          </div>
        </div>
      </div>

      {activeMyOrders.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-widest text-amber-500 flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
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
                className="bg-zinc-900/80 backdrop-blur-2xl border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)] rounded-3xl p-6 sm:p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-zinc-950 px-6 py-2 text-sm font-black uppercase tracking-wider rounded-bl-2xl shadow-lg">
                  {order.status}
                </div>
                
                <div className="space-y-6 pt-4 sm:pt-0">
                  <div className="pr-24">
                    <h3 className="text-3xl font-bold text-white mb-2">{order.restaurantName}</h3>
                    <div className="flex items-start gap-2 text-zinc-300">
                      <MapPin className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                      <p className="text-lg leading-tight">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-950/80 rounded-2xl p-5 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Customer</p>
                      <p className="text-lg font-bold text-white">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Order Total</p>
                      <p className="text-lg font-mono font-bold text-amber-500">${(order.total / 100).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items to deliver
                    </div>
                    {order.status === 'ready' ? (
                      <Button 
                        size="lg"
                        onClick={() => handleDeliver(order.id)} 
                        className="w-full sm:w-auto bg-amber-500 text-zinc-950 hover:bg-amber-600 font-bold text-lg px-8 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                      >
                        Complete Delivery
                      </Button>
                    ) : (
                      <Button disabled size="lg" className="w-full sm:w-auto bg-zinc-800 text-zinc-500 border-none font-bold">
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
        <div className="grid grid-cols-1 gap-5">
          <AnimatePresence>
            {availableOrders?.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-zinc-900/60 transition-all rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-2xl text-white group-hover:text-amber-400 transition-colors">{order.restaurantName}</h3>
                    <span className="font-mono text-sm bg-white/5 text-zinc-400 px-2 py-1 rounded">#{order.id}</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-300">
                    <MapPin className="w-4 h-4 shrink-0 text-amber-500 mt-1" />
                    <p className="leading-tight">{order.deliveryAddress}</p>
                  </div>
                  <div className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                    <Package className="w-4 h-4" /> {order.items.reduce((acc, i) => acc + i.quantity, 0)} items • ${(order.total / 100).toFixed(2)}
                  </div>
                </div>
                
                <Button 
                  size="lg"
                  onClick={() => handleAccept(order.id)} 
                  variant="outline"
                  className="border-white/20 hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-500 transition-all shrink-0 font-bold px-8 py-6 text-base shadow-lg"
                >
                  Accept Pickup
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {(!availableOrders || availableOrders.length === 0) && (
            <div className="text-center py-20 px-4 border-2 border-dashed border-white/5 rounded-3xl bg-zinc-900/10">
              <AlertCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-lg font-bold text-zinc-500">No pickups available</p>
              <p className="text-zinc-600 mt-1">Stand by for new orders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}