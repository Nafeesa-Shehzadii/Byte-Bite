import { useGetOrdersSummary, useListOrders, useUpdateOrderStatus, useListMyRestaurants, useDeleteRestaurant, useUpdateRestaurant, type Restaurant } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Utensils, CheckCircle, PlusCircle, Trash2, Store, Pencil, UtensilsCrossed } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrderTimeline } from "@/components/dashboard/order-timeline";
import { useState } from "react";

export default function RestaurantDashboard() {
  const { data: summary, isLoading: sumLoading } = useGetOrdersSummary();
  const { data: orders, isLoading: ordLoading } = useListOrders({ role: 'restaurant' });
  const { data: myRestaurants, isLoading: restLoading } = useListMyRestaurants();
  const updateStatus = useUpdateOrderStatus();
  const deleteRestaurant = useDeleteRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", imageUrl: "", cuisineType: "", deliveryTime: 30 });

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also remove all its menu items and orders. This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteRestaurant.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants/mine"] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] });
      toast.success("Restaurant deleted", { description: name });
    } catch {
      toast.error("Failed to delete restaurant");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (r: Restaurant) => {
    setEditForm({ name: r.name, description: r.description, imageUrl: r.imageUrl, cuisineType: r.cuisineType, deliveryTime: r.deliveryTime });
    setEditingRestaurant(r);
  };

  const handleEditSave = async () => {
    if (!editingRestaurant) return;
    try {
      await updateRestaurant.mutateAsync({ id: editingRestaurant.id, data: editForm });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants/mine"] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast.success("Restaurant updated", { description: editForm.name });
      setEditingRestaurant(null);
    } catch {
      toast.error("Failed to update restaurant");
    }
  };

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
          <Skeleton className="h-10 w-56 bg-[#161616] rounded-xl" />
          <Skeleton className="h-8 w-40 bg-[#161616] rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 bg-[#161616] rounded-3xl border border-white/[0.08]" />
          ))}
        </div>
        <Skeleton className="h-8 w-36 bg-[#161616] rounded-xl" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-64 bg-[#161616] rounded-3xl border border-white/[0.08] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const activeOrders = orders?.filter(o => o.status !== 'delivered') || [];

  return (
    <div className="container mx-auto px-4 space-y-8 sm:space-y-10 pb-20 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Kitchen Cockpit</h1>
        <Link href="/restaurant/add">
          <div className="flex items-center gap-2 text-sm font-bold bg-[#E63946] hover:bg-[#d32f3c] text-white px-4 py-2 rounded-full transition-colors cursor-pointer shadow-[0_0_15px_rgba(230,57,70,0.3)]">
            <PlusCircle className="w-4 h-4" /> Add Restaurant
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-[#141414] border-white/[0.08] shadow-2xl relative overflow-hidden rounded-3xl">
          <CardContent className="p-6 sm:p-8 flex flex-col justify-center relative z-10">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Today's Revenue</p>
            <div className="flex items-center gap-2 text-3xl sm:text-4xl font-black text-[#E63946] tracking-tight">
              <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 opacity-80" />
              {(summary?.revenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-white/[0.08] shadow-2xl relative overflow-hidden rounded-3xl">
          <CardContent className="p-6 sm:p-8 flex flex-col justify-center relative z-10">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Active Orders</p>
            <div className="flex items-center gap-3 text-3xl sm:text-4xl font-black text-white tracking-tight">
              <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
              {(summary?.placed || 0) + (summary?.accepted || 0) + (summary?.cooking || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-white/[0.08] shadow-2xl relative overflow-hidden rounded-3xl">
          <CardContent className="p-6 sm:p-8 flex flex-col justify-center relative z-10">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Completed</p>
            <div className="flex items-center gap-3 text-3xl sm:text-4xl font-black text-white tracking-tight">
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[#2EC4B6]" />
              {summary?.delivered || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RevenueChart orders={(orders || []) as any} />
        <OrderTimeline orders={(orders || []) as any} />
      </div>

      {/* My Restaurants */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <Store className="w-6 h-6 text-[#E63946]" />
          My Restaurants
          {myRestaurants && <span className="bg-[#E63946]/10 text-[#E63946] text-sm py-1 px-3 rounded-full font-bold">{myRestaurants.length}</span>}
        </h2>

        {restLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-40 bg-[#161616] rounded-3xl border border-white/[0.08]" />)}
          </div>
        ) : myRestaurants && myRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {myRestaurants.map(r => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#141414] border border-white/[0.08] rounded-3xl overflow-hidden hover:border-white/[0.14] transition-colors group"
              >
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="text-lg font-bold text-white drop-shadow-lg">{r.name}</h3>
                    <p className="text-xs text-gray-400">{r.cuisineType} &middot; {r.deliveryTime} min</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <Link href={`/restaurant/${r.id}/menu`}>
                    <Button variant="ghost" className="text-gray-400 hover:text-[#E63946] hover:bg-[#E63946]/5 text-xs font-bold gap-1.5 h-8 px-3 rounded-lg">
                      <UtensilsCrossed className="w-3.5 h-3.5" /> Manage Menu
                    </Button>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(r)}
                      className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === r.id}
                      onClick={() => handleDelete(r.id, r.name)}
                      className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className={`w-4 h-4 ${deletingId === r.id ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-white/[0.08] rounded-3xl bg-[#111111]">
            <Store className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-bold">No restaurants yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first restaurant to get started.</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
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
                className="bg-[#141414] border border-white/[0.08] hover:bg-[#181818] hover:border-white/[0.14] transition-colors shadow-2xl rounded-3xl p-5 sm:p-8 flex flex-col gap-5 sm:gap-6"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white truncate">
                      #{order.id} <span className="text-gray-500 mx-1 sm:mx-2">·</span> {order.customerName}
                    </h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#161616] border border-white/[0.08] text-[#E63946] text-xs font-bold uppercase tracking-widest">
                      {order.status}
                    </div>
                  </div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-[#E63946] bg-[#E63946]/10 px-3 sm:px-4 py-2 rounded-xl shrink-0">
                    ${(order.total).toFixed(2)}
                  </div>
                </div>

                <div className="bg-[#131313] rounded-2xl p-4 sm:p-5 border border-white/[0.06] space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm sm:text-base border-b border-white/[0.06] last:border-0 pb-2.5 last:pb-0">
                      <span className="font-medium text-gray-300">
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
                      className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600 font-bold text-base shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                      Accept Order
                    </Button>
                  )}
                  {order.status === 'accepted' && (
                    <Button
                      size="lg"
                      onClick={() => handleUpdate(order.id, 'cooking')}
                      className="w-full sm:w-auto bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold text-base shadow-md shadow-[#E63946]/15"
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
                    <Button size="lg" disabled variant="outline" className="w-full sm:w-auto border-white/[0.08] bg-[#141414] text-gray-500">
                      Waiting for Driver
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {activeOrders.length === 0 && (
            <div className="col-span-1 xl:col-span-2 text-center py-20 sm:py-24 px-4 border-2 border-dashed border-white/[0.08] rounded-3xl bg-[#111111]">
              <Utensils className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Board is clear</h3>
              <p className="text-gray-500 mt-2">Waiting for new orders to come in.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Restaurant Dialog */}
      <Dialog open={!!editingRestaurant} onOpenChange={(open) => { if (!open) setEditingRestaurant(null); }}>
        <DialogContent className="bg-[#141414] border-white/[0.08] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Restaurant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm font-medium">Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="bg-[#0C0C0C] border-white/[0.1] text-white focus:border-[#E63946]/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm font-medium">Description</Label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-md bg-[#0C0C0C] border border-white/[0.1] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#E63946]/50 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm font-medium">Cuisine Type</Label>
                <Input
                  value={editForm.cuisineType}
                  onChange={(e) => setEditForm(f => ({ ...f, cuisineType: e.target.value }))}
                  className="bg-[#0C0C0C] border-white/[0.1] text-white focus:border-[#E63946]/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm font-medium">Delivery Time (min)</Label>
                <Input
                  type="number"
                  value={editForm.deliveryTime}
                  onChange={(e) => setEditForm(f => ({ ...f, deliveryTime: Number(e.target.value) }))}
                  className="bg-[#0C0C0C] border-white/[0.1] text-white focus:border-[#E63946]/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm font-medium">Image URL</Label>
              <Input
                value={editForm.imageUrl}
                onChange={(e) => setEditForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="bg-[#0C0C0C] border-white/[0.1] text-white focus:border-[#E63946]/50"
              />
              {editForm.imageUrl && (
                <div className="rounded-xl overflow-hidden aspect-[16/9] border border-white/[0.06] mt-2">
                  <img src={editForm.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" onClick={() => setEditingRestaurant(null)} className="text-gray-400 hover:text-white">
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={updateRestaurant.isPending || !editForm.name || !editForm.description || !editForm.cuisineType || !editForm.imageUrl}
                className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold px-6 shadow-[0_0_15px_rgba(230,57,70,0.3)]"
              >
                {updateRestaurant.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
