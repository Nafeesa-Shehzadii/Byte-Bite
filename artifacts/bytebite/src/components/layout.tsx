import { Link, useLocation } from "wouter";
import { useAppStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { InitialsAvatar } from "./shared/initials-avatar";
import { ShoppingBag, Navigation, LogOut, Menu, X, ClipboardList, User, PlusCircle, Truck } from "lucide-react";
import { Button } from "./ui/button";
import { CartSidebar } from "./cart-sidebar";
import { Sheet, SheetContent } from "./ui/sheet";
import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function getNavLinks(role?: string): NavLink[] {
  if (role === "restaurant") {
    return [
      { href: "/restaurant", label: "Dashboard", icon: <ClipboardList className="w-4 h-4" /> },
      { href: "/restaurant/add", label: "Add Restaurant", icon: <PlusCircle className="w-4 h-4" /> },
      { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    ];
  }
  if (role === "driver") {
    return [
      { href: "/driver", label: "Dashboard", icon: <Truck className="w-4 h-4" /> },
      { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    ];
  }
  return [
    { href: "/", label: "Home", icon: <Navigation className="w-4 h-4" /> },
    { href: "/orders", label: "My Orders", icon: <ClipboardList className="w-4 h-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { cart } = useAppStore();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const controls = useAnimation();

  const cartQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navLinks = getNavLinks(user?.role);

  useEffect(() => {
    if (cartQuantity > 0) {
      controls.start({ scale: [1, 1.4, 1], transition: { duration: 0.3 } });
    }
  }, [cartQuantity, controls]);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-zinc-50 flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-[#FF6B6B] transition-colors">
            <Navigation className="w-6 h-6 fill-primary" />
            <span className="text-xl font-bold tracking-tight">ByteBite</span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* Cart (customer only) */}
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

                {/* Avatar + Name (desktop) */}
                <Link href="/profile" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <InitialsAvatar name={user.name} size="sm" />
                </Link>

                {/* Logout (desktop) */}
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden md:flex bg-[#111111] border-white/10 hover:bg-zinc-800 hover:text-primary text-zinc-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>

                {/* Mobile Menu Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden bg-[#111111] border-white/10 hover:bg-zinc-800 text-zinc-300"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Cart Sidebar */}
      <CartSidebar open={isCartOpen} onOpenChange={setIsCartOpen} />

      {/* Mobile Navigation Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="bg-[#0A0A0A] border-r border-white/10 w-72 p-0">
          <div className="p-6 border-b border-white/10">
            {user && (
              <div className="flex items-center gap-3">
                <InitialsAvatar name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                  <span className="inline-block mt-1 bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
          </div>
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
