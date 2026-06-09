import { useGetOrdersSummary, useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Utensils, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function RestaurantDashboard() {
  const { data: summary, isLoading: sumLoading } = useGetOrdersSummary();
  const { data: orders, isLoading: ordLoading } = useListOrders({ role: 'restaurant' });
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const handleUpdate = async (id: number, status: any) => {
    await updateStatus.mutateAsync({ id, data: { status } });
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
  };

  if (sumLoading || ordLoading) {
    return <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-3xl border border-white/10" />)}
      </div>
      <Skeleton className="h-[600px] w-full bg-white/5 rounded-3xl border border-white/10" />
    </div>;
  }

  const activeOrders = orders?.filter(o => o.status !== 'delivered') || [];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Kitchen Cockpit</h1>
        <div className="flex items-center gap-2 text-sm font-medium bg-zinc-900 px-4 py-2 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live updates active
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
          <CardContent className="p-8 flex flex-col justify-center relative z-10">
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Today's Revenue</p>
            <div className="flex items-center gap-2 text-4xl font-black text-amber-500 tracking-tight">
              <DollarSign className="w-8 h-8 opacity-80" />
              {((summary?.revenue || 0) / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/40 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <CardContent className="p-8 flex flex-col justify-center relative z-10">
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Active Orders</p>
            <div className="flex items-center gap-3 text-4xl font-black text-white tracking-tight">
              <Utensils className="w-7 h-7 text-blue-500" />
              {(summary?.placed || 0) + (summary?.accepted || 0) + (summary?.cooking || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          <CardContent className="p-8 flex flex-col justify-center relative z-10">
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Completed</p>
            <div className="flex items-center gap-3 text-4xl font-black text-white tracking-tight">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
              {summary?.delivered || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          Active Board
          <span className="bg-amber-500/10 text-amber-500 text-sm py-1 px-3 rounded-full font-bold">{activeOrders.length}</span>
        </h2>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {activeOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-zinc-900/50 backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-colors shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col gap-6"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">#{order.id} <span className="text-zinc-500 mx-2">•</span> {order.customerName}</h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-amber-500 text-xs font-bold uppercase tracking-widest shadow-inner">
                      {order.status}
                    </div>
                  </div>
                  <div className="font-mono text-xl font-bold text-amber-500 bg-amber-500/10 px-4 py-2 rounded-xl">
                    ${(order.total / 100).toFixed(2)}
                  </div>
                </div>

                <div className="bg-zinc-950/80 rounded-2xl p-5 border border-white/5 space-y-3 shadow-inner">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-base border-b border-white/5 last:border-0 pb-3 last:pb-0">
                      <span className="font-medium text-zinc-300">
                        <span className="inline-block w-8 text-amber-500 font-bold bg-amber-500/10 text-center rounded mr-3 py-0.5 text-sm">{item.quantity}x</span> 
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 justify-end mt-auto pt-2">
                  {order.status === 'placed' && (
                    <Button 
                      size="lg"
                      onClick={() => handleUpdate(order.id, 'accepted')} 
                      className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600 font-bold text-base shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                      Accept Order
                    </Button>
                  )}
                  {order.status === 'accepted' && (
                    <Button 
                      size="lg"
                      onClick={() => handleUpdate(order.id, 'cooking')} 
                      className="w-full sm:w-auto bg-amber-500 text-zinc-950 hover:bg-amber-600 font-bold text-base shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    >
                      Start Cooking
                    </Button>
                  )}
                  {order.status === 'cooking' && (
                    <Button 
                      size="lg"
                      onClick={() => handleUpdate(order.id, 'ready')} 
                      className="w-full sm:w-auto bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-base shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      Mark Ready for Pickup
                    </Button>
                  )}
                  {(order.status === 'ready' || order.status === 'delivered') && (
                    <Button size="lg" disabled variant="outline" className="w-full sm:w-auto border-white/10 bg-zinc-900/50">
                      Waiting for Driver
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeOrders.length === 0 && (
            <div className="col-span-1 xl:col-span-2 text-center py-24 px-4 border-2 border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
              <Utensils className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-500">Board is clear</h3>
              <p className="text-zinc-600 mt-2">Waiting for new orders to come in.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}