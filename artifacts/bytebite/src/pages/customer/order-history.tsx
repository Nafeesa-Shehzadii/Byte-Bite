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
  placed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cooking: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  ready: "bg-[#2EC4B6]/10 text-[#2EC4B6] border-[#2EC4B6]/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  assigned: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  pending_payment: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
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
      addToCart(
        { menuItemId: item.menuItemId, name: item.name, price: item.price, quantity: item.quantity },
        order.restaurantId,
        order.restaurantName,
      );
    }
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 max-w-3xl py-8 space-y-6">
          <Skeleton className="h-10 w-48 bg-[#111111] rounded-xl" />
          <Skeleton className="h-12 w-full bg-[#111111] rounded-xl" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full bg-[#111111] rounded-2xl border border-white/10 animate-pulse" />
          ))}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-3xl py-8 space-y-8">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Orders</h1>
          <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-bold">{orders?.length || 0}</span>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#111111] border border-white/10 rounded-xl px-4 h-12">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by restaurant..."
              className="bg-transparent flex-1 text-white placeholder:text-zinc-500 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "delivered"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f ? "bg-primary text-white" : "bg-[#111111] text-zinc-400 border border-white/5 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
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
                  className="bg-[#111111] border border-white/10 hover:border-primary/20 rounded-2xl p-5 sm:p-6 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-lg text-white">{order.restaurantName}</h3>
                        <span className="font-mono text-xs text-zinc-500">#{order.id}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[order.status] || STATUS_COLORS.placed}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5" />
                          {order.items.reduce((a, i) => a + i.quantity, 0)} items
                        </span>
                        <span className="font-mono text-primary font-bold">${(order.total / 100).toFixed(2)}</span>
                        {order.createdAt && (
                          <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-xs bg-white/5 text-zinc-400 px-2 py-0.5 rounded">
                            {item.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-zinc-600">+{order.items.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {isActive ? (
                        <Link href={`/track/${order.id}`}>
                          <Button size="sm" className="bg-primary text-white hover:bg-[#FF6B6B] font-bold">
                            Track <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/menu/${order.restaurantId}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-zinc-300 hover:text-white hover:border-primary/50"
                            onClick={() => handleReorder(order)}
                          >
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
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-[#111111]/30">
              <ClipboardList className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-lg font-bold text-zinc-500">No orders yet</p>
              <p className="text-zinc-600 mt-1 mb-4">Your order history will appear here.</p>
              <Link href="/">
                <Button className="bg-primary text-white hover:bg-[#FF6B6B] font-bold">
                  Browse Restaurants
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
