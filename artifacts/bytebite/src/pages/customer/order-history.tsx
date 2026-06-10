import { useListOrders } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/hooks/use-store";
import { PageTransition } from "@/components/shared/page-transition";
import { ClipboardList, Package, RefreshCcw, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cooking: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  ready: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  assigned: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  pending_payment: "bg-white/[0.04] text-gray-500 border-white/[0.1]",
};

export default function OrderHistory() {
  const { data: orders, isLoading } = useListOrders({});
  const { addToCart, clearCart } = useAppStore();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = (orders || []).filter((o) => {
    const matchFilter = filter === "all" || (filter === "active" ? o.status !== "delivered" : o.status === "delivered");
    const matchSearch = !search || o.restaurantName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleReorder = (order: any) => {
    clearCart();
    for (const item of order.items) {
      addToCart({ menuItemId: item.menuItemId, name: item.name, price: item.price, quantity: item.quantity }, order.restaurantId, order.restaurantName);
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="bg-[#0C0C0C] min-h-screen">
          <div className="container mx-auto px-4 max-w-3xl py-8 space-y-6">
            <Skeleton className="h-10 w-48 bg-white/[0.06] rounded-xl" />
            <Skeleton className="h-14 w-full bg-white/[0.06] rounded-full" />
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full bg-white/[0.06] rounded-2xl" />)}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="bg-[#0C0C0C] min-h-screen">
        <div className="container mx-auto px-4 max-w-3xl py-8 space-y-8">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-[#E63946]" />
            <h1 className="text-3xl font-black tracking-tight text-white">My Orders</h1>
            <span className="bg-[#E63946]/10 text-[#E63946] text-sm px-3 py-1 rounded-full font-bold">{orders?.length || 0}</span>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by restaurant..."
                className="w-full h-12 pl-11 pr-4 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] text-white placeholder:text-gray-500 outline-none focus:border-[#E63946]/40 focus:ring-2 focus:ring-[#E63946]/10 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "delivered"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize transition-all ${
                    filter === f ? "bg-[#E63946] text-white shadow-none" : "bg-white/[0.04] backdrop-blur-xl text-gray-500 border border-white/[0.1] hover:text-gray-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((order, i) => {
                const isActive = order.status !== "delivered";
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] hover:border-[#E63946]/20 rounded-2xl p-5 sm:p-6 transition-colors shadow-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-lg text-white">{order.restaurantName}</h3>
                          <span className="font-mono text-xs text-gray-500">#{order.id}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.status] || STATUS_COLORS.placed}`}>
                            {order.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> {order.items.reduce((a, i) => a + i.quantity, 0)} items</span>
                          <span className="font-bold text-[#E63946]">${(order.total).toFixed(2)}</span>
                          {order.createdAt && <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-xs bg-white/[0.04] text-gray-500 px-2 py-0.5 rounded-full border border-white/[0.08]">{item.name}</span>
                          ))}
                          {order.items.length > 3 && <span className="text-xs text-gray-500">+{order.items.length - 3} more</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {isActive ? (
                          <Link href={`/track/${order.id}`}>
                            <Button size="sm" className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold rounded-full px-5">
                              Track <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/menu/${order.restaurantId}`}>
                            <Button size="sm" variant="outline" className="border-white/[0.1] text-gray-500 hover:text-[#E63946] hover:border-[#E63946]/30 rounded-full px-5" onClick={() => handleReorder(order)}>
                              <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Reorder
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-20 border border-dashed border-white/[0.1] rounded-2xl bg-white/[0.04] backdrop-blur-xl">
                <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-bold text-gray-500">No orders yet</p>
                <p className="text-gray-500 text-sm mt-1 mb-5">Your order history will appear here.</p>
                <Link href="/"><Button className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold rounded-full px-6">Browse Restaurants</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
