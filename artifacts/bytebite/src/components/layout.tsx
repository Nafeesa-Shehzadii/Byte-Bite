import { Link, useLocation } from "wouter";
import { useAppStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { InitialsAvatar } from "./shared/initials-avatar";
import { ShoppingBag, Navigation, LogOut, Menu, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { CartSidebar } from "./cart-sidebar";
import { Sheet, SheetContent } from "./ui/sheet";
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

function getNavLinks(role?: string): { href: string; label: string }[] {
  if (role === "restaurant") return [
    { href: "/restaurant", label: "Dashboard" },
    { href: "/restaurant/add", label: "Add Restaurant" },
  ];
  if (role === "driver") return [
    { href: "/driver", label: "Dashboard" },
  ];
  return [
    { href: "/", label: "Home" },
    { href: "/orders", label: "My Orders" },
  ];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { cart } = useAppStore();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const controls = useAnimation();
  const profileRef = useRef<HTMLDivElement>(null);

  const cartQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navLinks = getNavLinks(user?.role);
  const isAuthPage = location === "/login" || location === "/register";

  useEffect(() => {
    if (cartQuantity > 0) controls.start({ scale: [1, 1.4, 1], transition: { duration: 0.3 } });
  }, [cartQuantity, controls]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => (href === "/" ? location === "/" : location === href);

  if (isAuthPage) {
    return <div className="min-h-[100dvh] font-sans">{children}</div>;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans bg-[#0A0A0A] text-zinc-50 selection:bg-primary/30">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0A]/80 ">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-[#E63946] hover:opacity-80 transition-opacity">
            <Navigation className="w-6 h-6 fill-[#E63946]" />
            <span className="text-xl font-bold tracking-tight">ByteBite</span>
          </Link>

          {/* Center Nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href) ? "bg-[#E63946]/10 text-[#E63946]" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {!user && (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-400 hover:text-white text-sm font-medium">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#E63946] text-white hover:bg-[#d32f3c] text-sm font-bold px-5 rounded-full h-9">Get Started</Button>
                </Link>
              </div>
            )}
            {user && (
              <>
                {/* Cart */}
                {user.role === "customer" && (
                  <Button variant="ghost" size="icon"
                    className="relative text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={() => setIsCartOpen(true)}>
                    <motion.div id="cart-icon" animate={controls}><ShoppingBag className="w-[18px] h-[18px]" /></motion.div>
                    {cartQuantity > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#E63946] text-white rounded-full text-[10px] flex items-center justify-center font-bold min-w-[18px] min-h-[18px]">
                        {cartQuantity}
                      </span>
                    )}
                  </Button>
                )}

                {/* Profile dropdown (desktop) */}
                <div className="hidden md:block relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <InitialsAvatar name={user.name} size="sm" />
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-56 bg-[#141414] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1.5 bg-[#E63946]/10 text-[#E63946] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{user.role}</span>
                        </div>
                        {/* Links */}
                        <div className="py-1">
                          <Link href="/profile" onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            Profile
                          </Link>
                          {user.role === "customer" && (
                            <Link href="/orders" onClick={() => setIsProfileOpen(false)}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                              Order History
                            </Link>
                          )}
                        </div>
                        {/* Sign out */}
                        <div className="border-t border-white/[0.06] py-1">
                          <button
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-500 hover:text-[#E63946] hover:bg-[#E63946]/5 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile menu button */}
                <Button variant="ghost" size="icon"
                  className="md:hidden text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="w-[18px] h-[18px]" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">{children}</main>

      <CartSidebar open={isCartOpen} onOpenChange={setIsCartOpen} />

      {/* Mobile sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="bg-[#0C0C0C] border-r border-white/[0.08] w-72 p-0">
          <div className="p-6 border-b border-white/[0.06]">
            {user && (
              <div className="flex items-center gap-3">
                <InitialsAvatar name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <span className="inline-block mt-1 bg-[#E63946]/10 text-[#E63946] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{user.role}</span>
                </div>
              </div>
            )}
          </div>
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href) ? "bg-[#E63946]/10 text-[#E63946]" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                {link.label}
              </Link>
            ))}
            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive("/profile") ? "bg-[#E63946]/10 text-[#E63946]" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              Profile
            </Link>
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/[0.06]">
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-[#E63946] hover:bg-[#E63946]/5 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
