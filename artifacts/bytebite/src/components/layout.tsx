import { Link, useLocation } from "wouter";
import { useAppStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { InitialsAvatar } from "./shared/initials-avatar";
import { ShoppingBag, Navigation, LogOut, Menu, ClipboardList, User, PlusCircle, Truck } from "lucide-react";
import { Button } from "./ui/button";
import { CartSidebar } from "./cart-sidebar";
import { Sheet, SheetContent } from "./ui/sheet";
import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface NavLink { href: string; label: string; icon: React.ReactNode; }

function getNavLinks(role?: string): NavLink[] {
  if (role === "restaurant") return [
    { href: "/restaurant", label: "Dashboard", icon: <ClipboardList className="w-4 h-4" /> },
    { href: "/restaurant/add", label: "Add Restaurant", icon: <PlusCircle className="w-4 h-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];
  if (role === "driver") return [
    { href: "/driver", label: "Dashboard", icon: <Truck className="w-4 h-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];
  return [
    { href: "/", label: "Home", icon: <Navigation className="w-4 h-4" /> },
    { href: "/orders", label: "My Orders", icon: <ClipboardList className="w-4 h-4" /> },
    { href: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];
}

const LIGHT_ROUTES = ["/", "/menu/"];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { cart } = useAppStore();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const controls = useAnimation();

  const cartQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navLinks = getNavLinks(user?.role);

  const isLightPage = LIGHT_ROUTES.some((r) => (r === "/" ? location === "/" : location.startsWith(r)));

  useEffect(() => {
    if (cartQuantity > 0) controls.start({ scale: [1, 1.4, 1], transition: { duration: 0.3 } });
  }, [cartQuantity, controls]);

  const isActive = (href: string) => (href === "/" ? location === "/" : location.startsWith(href));

  // Adaptive colors
  const bg = isLightPage ? "bg-white/80" : "bg-[#0A0A0A]/80";
  const border = isLightPage ? "border-gray-200/60" : "border-white/10";
  const logoColor = "text-[#E63946]";
  const navDefault = isLightPage ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100" : "text-zinc-400 hover:text-white hover:bg-white/5";
  const navActive = "bg-[#E63946]/10 text-[#E63946]";
  const btnOutline = isLightPage ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-[#111111] border-white/10 hover:bg-zinc-800 text-zinc-300";
  const wrapperBg = isLightPage ? "" : "bg-[#0A0A0A] text-zinc-50";

  return (
    <div className={`min-h-[100dvh] flex flex-col font-sans selection:bg-primary/30 ${wrapperBg}`}>
      <header className={`sticky top-0 z-50 border-b ${border} ${bg} backdrop-blur-xl`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className={`flex items-center gap-2 ${logoColor} hover:opacity-80 transition-opacity`}>
            <Navigation className="w-6 h-6 fill-[#E63946]" />
            <span className="text-xl font-bold tracking-tight">ByteBite</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href) ? navActive : navDefault}`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {user && (
              <>
                {user.role === "customer" && (
                  <Button variant="outline" size="icon" className={`relative ${btnOutline} hover:text-[#E63946]`} onClick={() => setIsCartOpen(true)}>
                    <motion.div id="cart-icon" animate={controls}><ShoppingBag className="w-4 h-4" /></motion.div>
                    {cartQuantity > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#E63946] text-white rounded-full text-xs flex items-center justify-center font-bold">{cartQuantity}</span>
                    )}
                  </Button>
                )}
                <Link href="/profile" className="hidden md:block"><InitialsAvatar name={user.name} size="sm" /></Link>
                <Button variant="outline" size="icon" className={`hidden md:flex ${btnOutline} hover:text-[#E63946]`} onClick={() => logout()}>
                  <LogOut className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className={`md:hidden ${btnOutline}`} onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">{children}</main>

      <CartSidebar open={isCartOpen} onOpenChange={setIsCartOpen} />

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="bg-[#0A0A0A] border-r border-white/10 w-72 p-0">
          <div className="p-6 border-b border-white/10">
            {user && (
              <div className="flex items-center gap-3">
                <InitialsAvatar name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                  <span className="inline-block mt-1 bg-[#E63946]/10 text-[#E63946] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{user.role}</span>
                </div>
              </div>
            )}
          </div>
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(link.href) ? "bg-[#E63946]/10 text-[#E63946]" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
