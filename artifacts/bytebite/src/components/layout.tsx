import { Link, useLocation } from "wouter";
import { useAppStore } from "@/hooks/use-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Navigation } from "lucide-react";
import { Button } from "./ui/button";
import { CartSidebar } from "./cart-sidebar";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, driverName, setDriverName, cart } = useAppStore();
  const [, setLocation] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleRoleChange = (newRole: any) => {
    setRole(newRole);
    if (newRole === "restaurant") setLocation("/restaurant");
    else if (newRole === "driver") setLocation("/driver");
    else setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-50 flex flex-col font-sans selection:bg-amber-500/30">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors">
            <Navigation className="w-6 h-6 fill-amber-500" />
            <span className="text-xl font-bold tracking-tight">ByteBite</span>
          </Link>

          <div className="flex items-center gap-4">
            {role === "driver" && (
              <Input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver Name"
                className="w-32 sm:w-48 bg-zinc-900/50 border-white/10 hidden sm:flex"
              />
            )}
            
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-[130px] bg-zinc-900/50 border-white/10 text-zinc-100">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-zinc-100">
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>

            {role === "customer" && (
              <Button
                variant="outline"
                size="icon"
                className="relative bg-zinc-900/50 border-white/10 hover:bg-zinc-800 hover:text-amber-500 text-zinc-300"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="w-4 h-4" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-zinc-950 rounded-full text-xs flex items-center justify-center font-bold">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <CartSidebar open={isCartOpen} onOpenChange={setIsCartOpen} />
    </div>
  );
}