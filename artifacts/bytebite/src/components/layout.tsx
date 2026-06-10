import { Link } from "wouter";
import { useAppStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Navigation, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { CartSidebar } from "./cart-sidebar";
import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { cart } = useAppStore();
  const { user, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
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
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-zinc-400">{user.name}</span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold uppercase">
                    {user.role}
                  </span>
                </div>

                {user.role === "customer" && (
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

                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#111111] border-white/10 hover:bg-zinc-800 hover:text-primary text-zinc-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
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
