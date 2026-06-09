import { Link, useLocation } from "wouter";
import { useAppStore } from "@/hooks/use-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { CartSidebar } from "./cart-sidebar";
import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, driverName, setDriverName, cart } = useAppStore();
  const [, setLocation] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const controls = useAnimation();
  
  const cartQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (cartQuantity > 0) {
      controls.start({
        scale: [1, 1.4, 1],
        transition: { duration: 0.3 }
      });
    }
  }, [cartQuantity, controls]);

  const handleRoleChange = (newRole: any) => {
    setRole(newRole);
    if (newRole === "restaurant") setLocation("/restaurant");
    else if (newRole === "driver") setLocation("/driver");
    else setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-zinc-50 flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-[#FF6B6B] transition-colors">
            <Navigation className="w-6 h-6 fill-primary" />
            <span className="text-xl font-bold tracking-tight">ByteBite</span>
          </Link>

          <div className="flex items-center gap-4">
            {role === "driver" && (
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver Name"
                className="w-32 sm:w-48 bg-[#111111] border-white/10 hidden sm:flex"
              />
            )}
            
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-[130px] bg-[#111111] border-white/10 text-zinc-100">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10 text-zinc-100">
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>

            {role === "customer" && (
              <Button
                variant="outline"
                size="icon"
                className="relative bg-[#111111] border-white/10 hover:bg-zinc-800 hover:text-primary text-zinc-300"
                onClick={() => setIsCartOpen(true)}
              >
                <motion.div id="cart-icon" animate={controls}>
                  <ShoppingBag className="w-4 h-4" />
                </motion.div>
                {cartQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">
                    {cartQuantity}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <CartSidebar open={isCartOpen} onOpenChange={setIsCartOpen} />
    </div>
  );
}
