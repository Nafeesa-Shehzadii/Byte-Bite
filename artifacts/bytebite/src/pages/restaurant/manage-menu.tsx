import { useGetRestaurant, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, type MenuItem } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, UtensilsCrossed, DollarSign, Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import { useState } from "react";

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  available: boolean;
}

const emptyForm: MenuItemForm = { name: "", description: "", price: "", category: "", imageUrl: "", available: true };

export default function ManageMenu({ params }: { params: { id: string } }) {
  const restaurantId = Number(params.id);
  const { data: restaurant, isLoading } = useGetRestaurant(restaurantId);
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const queryClient = useQueryClient();

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<MenuItemForm>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${restaurantId}`] });
    queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingItem(null);
    setIsAdding(true);
  };

  const openEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
    });
    setEditingItem(item);
    setIsAdding(true);
  };

  const handleSave = async () => {
    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      imageUrl: form.imageUrl,
      available: form.available,
    };

    try {
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, data });
        toast.success("Item updated", { description: form.name });
      } else {
        await createItem.mutateAsync({ data: { ...data, restaurantId } });
        toast.success("Item added", { description: form.name });
      }
      invalidate();
      setIsAdding(false);
      setEditingItem(null);
    } catch {
      toast.error(editingItem ? "Failed to update item" : "Failed to add item");
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    setDeletingId(item.id);
    try {
      await deleteItem.mutateAsync({ id: item.id });
      invalidate();
      toast.success("Item deleted", { description: item.name });
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await updateItem.mutateAsync({ id: item.id, data: { available: !item.available } });
      invalidate();
      toast.success(item.available ? "Item hidden" : "Item visible", { description: item.name });
    } catch {
      toast.error("Failed to update availability");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-8 space-y-6">
        <Skeleton className="h-8 w-48 bg-[#161616] rounded-xl" />
        <Skeleton className="h-12 w-full bg-[#161616] rounded-2xl" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 bg-[#161616] rounded-2xl border border-white/[0.08]" />)}
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg">Restaurant not found</p>
        <Link href="/restaurant"><Button variant="ghost" className="mt-4 text-[#E63946]">Back to Dashboard</Button></Link>
      </div>
    );
  }

  const menuItems = restaurant.menuItems || [];
  const categories = [...new Set(menuItems.map(i => i.category))].sort();

  return (
    <div className="container mx-auto px-4 max-w-4xl py-8 pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-4">
          <Link href="/restaurant">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{restaurant.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage menu items &middot; {menuItems.length} items</p>
          </div>
        </div>
        <Button
          onClick={openAdd}
          className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold rounded-full px-5 shadow-[0_0_15px_rgba(230,57,70,0.3)]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Menu Items by Category */}
      {categories.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/[0.08] rounded-3xl bg-[#111111]">
          <UtensilsCrossed className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400">No menu items yet</h3>
          <p className="text-gray-500 mt-2 mb-6">Add your first item to get started.</p>
          <Button onClick={openAdd} className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      ) : (
        categories.map(category => (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {category}
              <span className="text-xs text-gray-500 font-medium bg-white/[0.06] px-2 py-0.5 rounded-full">
                {menuItems.filter(i => i.category === category).length}
              </span>
            </h2>

            <div className="space-y-2">
              <AnimatePresence>
                {menuItems.filter(i => i.category === category).map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`bg-[#141414] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-4 hover:border-white/[0.14] transition-colors group ${!item.available ? 'opacity-50' : ''}`}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/[0.06]">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white truncate">{item.name}</h3>
                        {!item.available && (
                          <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full uppercase">Hidden</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#E63946]" />
                        <span className="text-sm font-bold text-[#E63946]">{item.price.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleAvailable(item)}
                        className="text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                        title={item.available ? "Hide item" : "Show item"}
                      >
                        {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                        className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className={`w-4 h-4 ${deletingId === item.id ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isAdding} onOpenChange={(open) => { if (!open) { setIsAdding(false); setEditingItem(null); } }}>
        <DialogContent className="bg-[#141414] border-white/[0.08] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm font-medium">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Classic Burger"
                  className="bg-[#0C0C0C] border-white/[0.1] text-white focus:border-[#E63946]/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm font-medium">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="12.99"
                  className="bg-[#0C0C0C] border-white/[0.1] text-white focus:border-[#E63946]/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm font-medium">Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Describe this dish..."
                className="w-full rounded-md bg-[#0C0C0C] border border-white/[0.1] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#E63946]/50 resize-none placeholder:text-gray-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm font-medium">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Mains, Sides"
                  className="bg-[#0C0C0C] border-white/[0.1] text-white focus:border-[#E63946]/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-400 text-sm font-medium">Available</Label>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                  className={`w-full h-9 rounded-md border text-sm font-medium transition-colors ${
                    form.available
                      ? "bg-[#2EC4B6]/10 border-[#2EC4B6]/30 text-[#2EC4B6]"
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                  }`}
                >
                  {form.available ? "Visible" : "Hidden"}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 text-sm font-medium">Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="bg-[#0C0C0C] border-white/[0.1] text-white focus:border-[#E63946]/50"
              />
              {form.imageUrl && (
                <div className="rounded-xl overflow-hidden aspect-video border border-white/[0.06] mt-2 max-h-40">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-gray-400 hover:text-white">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createItem.isPending || updateItem.isPending || !form.name || !form.price || !form.category || !form.imageUrl || !form.description}
                className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold px-6 shadow-[0_0_15px_rgba(230,57,70,0.3)]"
              >
                {(createItem.isPending || updateItem.isPending) ? "Saving..." : editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
