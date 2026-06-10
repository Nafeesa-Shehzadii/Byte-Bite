import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAppStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useCreateOrder } from "@workspace/api-client-react";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Minus, Plus, ShoppingBag, UtensilsCrossed, CreditCard, Banknote, Lock } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";

type PaymentMethod = "card" | "cod";

export function CartSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { cart, removeFromCart, addToCart, clearCart, cartRestaurantId, cartRestaurantName } = useAppStore();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const createOrder = useCreateOrder();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const formattedTotal = total.toFixed(2);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      onOpenChange(false);
      setLocation("/login");
      return;
    }
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
          items: cart,
        },
      });

      if (paymentMethod === "card") {
        // Redirect to Stripe Checkout
        const checkoutRes = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            orderId: order.id,
            items: cart.map((i) => ({ menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity })),
          }),
        });

        if (!checkoutRes.ok) {
          const err = await checkoutRes.json().catch(() => ({}));
          toast.error(err.error || "Payment setup failed");
          return;
        }

        const session = await checkoutRes.json();
        if (session?.url) {
          clearCart();
          onOpenChange(false);
          // Stripe URLs start with https, simulated ones are relative
          if (session.url.startsWith("http")) {
            window.location.href = session.url;
          } else {
            setLocation(session.url);
          }
          return;
        }
      }

      // Cash on delivery -- go straight to tracker
      toast.success("Order placed!", { description: `Order #${order.id} -- pay on delivery` });
      clearCart();
      onOpenChange(false);
      setLocation(`/track/${order.id}`);
    } catch {
      toast.error("Failed to place order", { description: "Please try again" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white border-l border-gray-200 text-gray-900 w-full sm:max-w-md flex flex-col p-0 shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <SheetTitle className="text-gray-900 text-lg font-bold">Your Order</SheetTitle>
          {cart.length > 0 && (
            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
              {cart.reduce((a, i) => a + i.quantity, 0)} items
            </span>
          )}
        </div>

        {/* Items */}
        <ScrollArea className="flex-1 p-5 sm:p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center pt-16 pb-8 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-400">Your cart is empty</p>
                <p className="text-sm text-gray-400 max-w-[220px]">Browse restaurants and add items to get started.</p>
              </div>
              <Link
                href="/"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-2 text-[#E63946] text-sm font-bold hover:underline mt-2"
              >
                <UtensilsCrossed className="w-4 h-4" /> Browse Restaurants
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cartRestaurantName && (
                <p className="text-[#E63946] font-medium text-sm border-b border-gray-100 pb-2">
                  Ordering from {cartRestaurantName}
                </p>
              )}
              {cart.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm leading-tight truncate text-gray-900">{item.name}</h4>
                    <p className="text-gray-500 text-sm mt-0.5">${(item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-gray-200 shrink-0">
                    <button
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-800 transition-colors"
                      onClick={() => {
                        if (item.quantity > 1) addToCart({ ...item, quantity: -1 }, cartRestaurantId!, cartRestaurantName!);
                        else removeFromCart(item.menuItemId);
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="w-6 text-center text-sm font-bold text-gray-900 inline-block"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      className="w-7 h-7 flex items-center justify-center hover:bg-[#E63946]/10 rounded-md text-[#E63946] transition-colors"
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

        {/* Checkout Footer */}
        {cart.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-gray-100 space-y-4 bg-white">
            {/* Total */}
            <div className="flex justify-between text-lg font-bold items-center">
              <span className="text-gray-900">Total</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={formattedTotal}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-[#E63946] font-mono block"
                >
                  ${formattedTotal}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
              {user && (
                <p className="text-xs text-gray-500">
                  Ordering as <span className="text-gray-800 font-medium">{user.name}</span>
                </p>
              )}

              {/* Address */}
              <input
                placeholder="Delivery Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#E63946]/40 focus:ring-2 focus:ring-[#E63946]/10 text-sm"
              />

              {/* Payment Method */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                      paymentMethod === "card"
                        ? "border-[#E63946] bg-[#E63946]/5 text-[#E63946]"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <div className="text-left">
                      <span className="block text-xs font-bold">Card</span>
                      <span className={`block text-[10px] ${paymentMethod === "card" ? "text-[#E63946]/60" : "text-gray-400"}`}>
                        Pay online
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#E63946] bg-[#E63946]/5 text-[#E63946]"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <div className="text-left">
                      <span className="block text-xs font-bold">Cash</span>
                      <span className={`block text-[10px] ${paymentMethod === "cod" ? "text-[#E63946]/60" : "text-gray-400"}`}>
                        Pay on delivery
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* CTA */}
              <Button
                className="w-full bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold text-sm h-12 rounded-xl shadow-md shadow-[#E63946]/15 transition-all"
                onClick={handleCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  "Placing Order..."
                ) : (
                  <span className="flex items-center gap-2">
                    {paymentMethod === "card" ? <Lock className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />}
                    {paymentMethod === "card" ? `Pay $${formattedTotal}` : `Place Order -- $${formattedTotal}`}
                  </span>
                )}
              </Button>

              {paymentMethod === "card" && (
                <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Secured by Stripe. You will be redirected to complete payment.
                </p>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
