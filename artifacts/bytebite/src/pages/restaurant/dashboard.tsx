import { useGetOrdersSummary, useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Utensils, CheckCircle, PlusCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrderTimeline } from "@/components/dashboard/order-timeline";

export default function RestaurantDashboard() {
  const { data: summary, isLoading: sumLoading } = useGetOrdersSummary();
  const { data: orders, isLoading: ordLoading } = useListOrders({ role: 'restaurant' });
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();

  const handleUpdate = async (id: number, status: any) => {
    await updateStatus.mutateAsync({ id, data: { status } });
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
    const labels: Record<string, string> = { accepted: "Order accepted", cooking: "Cooking started", ready: "Marked ready" };
    toast.success(labels[status] || "Status updated", { description: `Order #${id}` });
  };

  if (sumLoading || ordLoading) {
    return (
      <div className="container mx-auto px-4 space-y-8 py-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-56 bg-white rounded-xl" />
          <Skeleton className="h-8 w-40 bg-white rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 bg-white rounded-3xl border border-gray-100" />
          ))}
        </div>
        <Skeleton className="h-8 w-36 bg-white rounded-xl" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-64 bg-white rounded-3xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const activeOrders = orders?.filter(o => o.status !== 'delivered') || [];

  return (
    <div className="container mx-auto px-4 space-y-8 sm:space-y-10 pb-20 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Kitchen Cockpit</h1>
        <div className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-full border border-gray-100 text-gray-900">
          <span className="w-2 h-2 rounded-full bg-[#2EC4B6] animate-pulse" /> Live updates active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E63946]/10 rounded-full blur-3xl" />
          <CardContent className="p-6 sm:p-8 flex flex-col justify-center relative z-10">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Today's Revenue</p>
            <div className="flex items-center gap-2 text-3xl sm:text-4xl font-black text-[#E63946] tracking-tight">
              <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 opacity-80" />
              {(summary?.revenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <CardContent className="p-6 sm:p-8 flex flex-col justify-center relative z-10">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Active Orders</p>
            <div className="flex items-center gap-3 text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
              {(summary?.placed || 0) + (summary?.accepted || 0) + (summary?.cooking || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-100 shadow-2xl relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2EC4B6]/10 rounded-full blur-3xl" />
          <CardContent className="p-6 sm:p-8 flex flex-col justify-center relative z-10">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Completed</p>
            <div className="flex items-center gap-3 text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[#2EC4B6]" />
              {summary?.delivered || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Timeline + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <RevenueChart orders={(orders || []) as any} />
        </div>
        <div className="space-y-4">
          <OrderTimeline orders={(orders || []) as any} />
          <Link href="/restaurant/add">
            <div className="flex items-center gap-3 bg-white border border-gray-100 hover:border-[#E63946]/30 rounded-2xl p-4 transition-colors cursor-pointer group">
              <div className="w-10 h-10 bg-[#E63946]/10 rounded-xl flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-[#E63946]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 group-hover:text-[#E63946] transition-colors">Add Restaurant</p>
                <p className="text-xs text-gray-400">Register a new kitchen</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          Active Board
          <span className="bg-[#E63946]/10 text-[#E63946] text-sm py-1 px-3 rounded-full font-bold">{activeOrders.length}</span>
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <AnimatePresence>
            {activeOrders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white backdrop-blur-sm border border-gray-100 hover:border-[#E63946]/30 transition-colors shadow-2xl rounded-3xl p-5 sm:p-8 flex flex-col gap-5 sm:gap-6"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      #{order.id} <span className="text-gray-400 mx-1 sm:mx-2">·</span> {order.customerName}
                    </h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 border border-gray-100 text-[#E63946] text-xs font-bold uppercase tracking-widest shadow-inner">
                      {order.status}
                    </div>
                  </div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-[#E63946] bg-[#E63946]/10 px-3 sm:px-4 py-2 rounded-xl shrink-0">
                    ${(order.total).toFixed(2)}
                  </div>
                </div>

                <div className="bg-[#FAFAF8] rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-3 shadow-inner">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm sm:text-base border-b border-gray-100 last:border-0 pb-2.5 last:pb-0">
                      <span className="font-medium text-gray-600">
                        <span className="inline-block w-7 sm:w-8 text-[#E63946] font-bold bg-[#E63946]/10 text-center rounded mr-2 sm:mr-3 py-0.5 text-xs sm:text-sm">{item.quantity}x</span>
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
                      className="w-full sm:w-auto bg-blue-500 text-gray-900 hover:bg-blue-600 font-bold text-base shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                      Accept Order
                    </Button>
                  )}
                  {order.status === 'accepted' && (
                    <Button
                      size="lg"
                      onClick={() => handleUpdate(order.id, 'cooking')}
                      className="w-full sm:w-auto bg-[#E63946] text-gray-900 hover:bg-[#d32f3c] font-bold text-base shadow-md shadow-[#E63946]/15"
                    >
                      Start Cooking
                    </Button>
                  )}
                  {order.status === 'cooking' && (
                    <Button
                      size="lg"
                      onClick={() => handleUpdate(order.id, 'ready')}
                      className="w-full sm:w-auto bg-[#2EC4B6] text-[#0A0A0A] hover:bg-[#20a498] font-bold text-base shadow-[0_0_20px_rgba(46,196,182,0.3)]"
                    >
                      Mark Ready for Pickup
                    </Button>
                  )}
                  {(order.status === 'ready' || order.status === 'delivered') && (
                    <Button size="lg" disabled variant="outline" className="w-full sm:w-auto border-gray-100 bg-[#FAFAF8] text-gray-400">
                      Waiting for Driver
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeOrders.length === 0 && (
            <div className="col-span-1 xl:col-span-2 text-center py-20 sm:py-24 px-4 border-2 border-dashed border-gray-100 rounded-3xl bg-white/20">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Board is clear</h3>
              <p className="text-gray-400 mt-2">Waiting for new orders to come in.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
