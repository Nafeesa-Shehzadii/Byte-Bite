import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAppStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrder, useCreateCheckoutSession } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartSidebar({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { cart, removeFromCart, addToCart, clearCart, cartRestaurantId, cartRestaurantName } = useAppStore();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const { toast } = useToast();
  
  const createOrder = useCreateOrder();
  const useCheckout = (useCreateCheckoutSession as any);
  const createCheckout = useCheckout ? useCheckout() : null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!name || !address) {
      toast({ title: "Details required", description: "Please enter your name and address", variant: "destructive" });
      return;
    }
    if (cart.length === 0 || !cartRestaurantId) return;

    try {
      const order = await createOrder.mutateAsync({
        data: {
          customerName: name,
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

      clearCart();
      onOpenChange(false);
      setLocation(`/track/${order.id}`);
      
    } catch (e) {
      toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 text-zinc-50 w-full sm:max-w-md flex flex-col p-0 shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <SheetTitle className="text-zinc-50 text-xl font-bold">Your Order</SheetTitle>
        </div>
        
        <ScrollArea className="flex-1 p-6">
          {cart.length === 0 ? (
            <div className="text-center text-zinc-500 mt-20 space-y-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-zinc-700" />
              </div>
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartRestaurantName && (
                <p className="text-amber-500 font-medium text-sm mb-4 border-b border-white/10 pb-2">
                  Ordering from {cartRestaurantName}
                </p>
              )}
              {cart.map(item => (
                <div key={item.menuItemId} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                    <p className="text-zinc-400 text-sm mt-1">${(item.price / 100).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950 rounded-lg p-1 border border-white/10">
                    <button 
                      className="w-7 h-7 flex items-center justify-center hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
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
                    <span className="w-6 text-center text-sm font-mono">{item.quantity}</span>
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
          <div className="p-6 border-t border-white/10 bg-zinc-950 space-y-4 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-10 relative">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-amber-500 font-mono">${(total / 100).toFixed(2)}</span>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-white/10">
              <Input 
                placeholder="Your Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500 h-12"
              />
              <Input 
                placeholder="Delivery Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500 h-12"
              />
              <Button 
                className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-600 font-bold text-lg h-12 mt-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all"
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