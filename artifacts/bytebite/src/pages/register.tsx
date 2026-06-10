import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Navigation, Mail, Lock, UserRound, UtensilsCrossed, Store, Truck, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BG = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&q=85";

const ROLES = [
  { value: "customer", label: "Customer", icon: UtensilsCrossed, desc: "Order & track food" },
  { value: "restaurant", label: "Restaurant", icon: Store, desc: "Manage your kitchen" },
  { value: "driver", label: "Driver", icon: Truck, desc: "Deliver orders" },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const s = password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const c = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500"];
  const l = ["", "Weak", "Fair", "Strong"];
  const t = ["", "text-red-400", "text-amber-400", "text-emerald-400"];
  return (
    <div className="flex items-center gap-2.5 pt-0.5">
      <div className="flex gap-1 flex-1">{[1, 2, 3].map((i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= s ? c[s] : "bg-white/[0.08]"}`} />)}</div>
      <span className={`text-[11px] font-medium ${t[s]}`}>{l[s]}</span>
    </div>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      useAppStore.getState().clearCart();
      const user = await register(name, email, password, role);
      if (user.role === "restaurant") setLocation("/restaurant");
      else if (user.role === "driver") setLocation("/driver");
      else setLocation("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-gray-500 outline-none focus:bg-white/[0.1] focus:border-[#E63946]/60 focus:ring-1 focus:ring-[#E63946]/20 text-sm transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={BG} alt="" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-[#0C0C0C]/70 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-[#0C0C0C]/40" />
      </div>

      {/* Glassmorphism modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm bg-white/[0.05] backdrop-blur-2xl rounded-3xl shadow-2xl p-7 sm:p-9 border border-white/[0.1] my-auto"
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 text-[#E63946]">
            <Navigation className="w-8 h-8 fill-[#E63946]" />
            <span className="text-3xl font-black tracking-tight">ByteBite</span>
          </Link>
          <h1 className="text-2xl font-black text-white mt-6">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Start ordering in under a minute</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#E63946]/10 border border-[#E63946]/20 text-[#E63946] text-sm rounded-xl px-4 py-3">
              {error}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Full name</label>
            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                placeholder="Min 8 characters" className={`${inputClass} !pr-12`} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">I want to...</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={`relative flex flex-col items-center gap-1.5 py-3.5 px-1 rounded-xl border text-center transition-all ${
                      active
                        ? "border-[#E63946]/60 bg-[#E63946]/10 text-[#E63946]"
                        : "border-white/[0.08] bg-white/[0.04] text-gray-500 hover:border-white/[0.15] hover:text-gray-300"
                    }`}>
                    {active && <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#E63946] rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                    <r.icon className="w-5 h-5" />
                    <span className="text-[11px] font-bold leading-tight">{r.label}</span>
                    <span className={`text-[9px] leading-tight ${active ? "text-[#E63946]/60" : "text-gray-600"}`}>{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={loading}
            className="w-full bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold h-12 text-sm rounded-xl shadow-[0_0_30px_rgba(230,57,70,0.25)] hover:shadow-[0_0_40px_rgba(230,57,70,0.35)] transition-all">
            {loading ? "Creating account..." : <>Create Account <ArrowRight className="w-4 h-4 ml-1.5" /></>}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
          <div className="relative flex justify-center"><span className="bg-transparent backdrop-blur-xl px-4 text-xs text-gray-600">or</span></div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-[#E63946] font-semibold hover:text-[#FF6B6B] transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
