import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAppStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrder, useCreateCheckoutSession } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Minus, Plus, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";

export function CartSidebar({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { cart, removeFromCart, addToCart, clearCart, cartRestaurantId, cartRestaurantName } = useAppStore();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [address, setAddress] = useState("");

  const createOrder = useCreateOrder();
  const useCheckout = (useCreateCheckoutSession as any);
  const createCheckout = useCheckout ? useCheckout() : null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const formattedTotal = (total / 100).toFixed(2);

  const handleCheckout = async () => {
    if (!address) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (cart.length === 0 || !cartRestaurantId) return;

    try {
      const order = await createOrder.mutateAsync({
        data: {
          customerName: user?.name || "Guest",
          deliveryAddress: address,
          restaurantId: cartRestaurantId,
          restaurantName: cartRestaurantName || "Restaurant",
          total,
          items: cart
        }
      });

      if (createCheckout) {
        try {
          const session = await createCheckout.mutateAsync({ data: { orderId: order.id, items: cart } });
          if (session?.url) {
            window.location.href = session.url;
            return;
          }
        } catch (e) {
          console.error("Checkout session failed", e);
        }
      }

      toast.success("Order placed!", { description: `Order #${order.id} from ${cartRestaurantName}` });
      clearCart();
      onOpenChange(false);
      setLocation(`/track/${order.id}`);

    } catch {
      toast.error("Failed to place order", { description: "Please try again" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#0A0A0A]/95 backdrop-blur-2xl border-l border-white/10 text-zinc-50 w-full sm:max-w-md flex flex-col p-0 shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <SheetTitle className="text-zinc-50 text-xl font-bold">Your Order</SheetTitle>
          {cart.length > 0 && (
            <span className="text-xs text-zinc-500 font-mono">{cart.reduce((a, i) => a + i.quantity, 0)} items</span>
          )}
        </div>

        <ScrollArea className="flex-1 p-6 bg-[#0A0A0A]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center pt-16 pb-8 space-y-4">
              <div className="w-20 h-20 bg-[#111111] rounded-3xl border border-white/10 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-zinc-600" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-zinc-400">Your cart is empty</p>
                <p className="text-sm text-zinc-600 max-w-[220px]">
                  Browse restaurants and add items to get started.
                </p>
              </div>
              <Link
                href="/"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-2 text-primary text-sm font-bold hover:text-[#FF6B6B] transition-colors mt-2"
              >
                <UtensilsCrossed className="w-4 h-4" />
                Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartRestaurantName && (
                <p className="text-primary font-medium text-sm border-b border-white/10 pb-2">
                  Ordering from {cartRestaurantName}
                </p>
              )}
              {cart.map(item => (
                <div key={item.menuItemId} className="flex items-center gap-4 bg-[#111111] p-4 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm leading-tight truncate">{item.name}</h4>
                    <p className="text-zinc-400 text-sm mt-1">${(item.price / 100).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-1 border border-white/10 shrink-0">
                    <button
                      className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
                      onClick={() => {
                        if (item.quantity > 1) {
                          addToCart({ ...item, quantity: -1 }, cartRestaurantId!, cartRestaurantName!);
                        } else {
                          removeFromCart(item.menuItemId);
                        }
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 1.4 }}
                      animate={{ scale: 1 }}
                      className="w-6 text-center text-sm font-mono inline-block"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
                      onClick={() => addToCart({ ...item, quantity: 1 }, cartRestaurantId!, cartRestaurantName!)}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#0A0A0A] space-y-4 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-10 relative">
            <div className="flex justify-between text-lg font-bold items-center">
              <span>Total</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={formattedTotal}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-primary font-mono block"
                >
                  ${formattedTotal}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              {user && (
                <p className="text-sm text-zinc-400">Ordering as <span className="text-white font-medium">{user.name}</span></p>
              )}
              <Input
                placeholder="Delivery Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-500 h-12"
              />
              <Button
                className="w-full bg-primary text-white hover:bg-[#FF6B6B] font-bold text-lg h-12 mt-2 transition-all shadow-[0_0_20px_rgba(230,57,70,0.2)] hover:shadow-[0_0_30px_rgba(230,57,70,0.4)]"
                onClick={handleCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Placing Order..." : "Checkout"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
