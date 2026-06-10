import { useAuth } from "@/hooks/use-auth";
import { useListOrders } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { PageTransition } from "@/components/shared/page-transition";
import { Button } from "@/components/ui/button";
import { ClipboardList, Store, Truck, LogOut, ArrowRight, Mail, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: orders } = useListOrders({});

  if (!user) return null;

  const totalOrders = orders?.length || 0;
  const totalSpent = (orders || []).reduce((a, o) => a + o.total, 0);

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-lg py-12 space-y-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#111111] border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex justify-center">
              <InitialsAvatar name={user.name} size="lg" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-sm text-zinc-400">{user.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-bold uppercase">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-white">{totalOrders}</p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">Total Orders</p>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-primary font-mono">${(totalSpent / 100).toFixed(0)}</p>
            <p className="text-xs text-zinc-500 mt-1 font-medium">Total Spent</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          {user.role === "customer" && (
            <Link href="/orders">
              <QuickLink icon={<ClipboardList className="w-5 h-5" />} label="My Orders" desc="View order history" />
            </Link>
          )}
          {user.role === "restaurant" && (
            <>
              <Link href="/restaurant">
                <QuickLink icon={<Store className="w-5 h-5" />} label="Dashboard" desc="Manage your kitchen" />
              </Link>
              <Link href="/restaurant/add">
                <QuickLink icon={<Store className="w-5 h-5" />} label="Add Restaurant" desc="Register a new restaurant" />
              </Link>
            </>
          )}
          {user.role === "driver" && (
            <Link href="/driver">
              <QuickLink icon={<Truck className="w-5 h-5" />} label="Dashboard" desc="Accept deliveries" />
            </Link>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 h-12 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </PageTransition>
  );
}

function QuickLink({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 bg-[#111111] border border-white/10 hover:border-primary/30 rounded-2xl p-4 transition-colors cursor-pointer group">
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm group-hover:text-primary transition-colors">{label}</p>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
    </div>
  );
}
