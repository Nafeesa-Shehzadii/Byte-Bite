import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthBackground } from "@/components/auth/auth-background";
import { Navigation, Eye, EyeOff, UtensilsCrossed, Store, Truck } from "lucide-react";
import { motion } from "framer-motion";

const ROLES = [
  { value: "customer", label: "Customer", icon: UtensilsCrossed, desc: "Order food" },
  { value: "restaurant", label: "Restaurant", icon: Store, desc: "Manage kitchen" },
  { value: "driver", label: "Driver", icon: Truck, desc: "Deliver orders" },
];

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const colors = ["", "bg-red-500", "bg-yellow-500", "bg-[#2EC4B6]"];
  const labels = ["", "Weak", "Fair", "Strong"];

  if (password.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : "bg-zinc-800"}`} />
        ))}
      </div>
      <span className="text-[10px] text-zinc-500">{labels[strength]}</span>
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

  return (
    <AuthBackground>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#111111]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-primary mb-3">
            <Navigation className="w-7 h-7 fill-primary" />
            <span className="text-2xl font-extrabold tracking-tight">ByteBite</span>
          </div>
          <p className="text-zinc-400 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3"
            >
              {error}
            </motion.div>
          )}

          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-[#0A0A0A]/60 border-white/10 text-white placeholder:text-zinc-500 h-12 rounded-xl focus:border-primary/50"
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0A0A0A]/60 border-white/10 text-white placeholder:text-zinc-500 h-12 rounded-xl focus:border-primary/50"
          />
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-[#0A0A0A]/60 border-white/10 text-white placeholder:text-zinc-500 h-12 rounded-xl pr-12 focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Role Cards */}
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 font-medium">I am a...</p>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(230,57,70,0.15)]"
                        : "border-white/10 bg-[#0A0A0A]/40 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <r.icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white hover:bg-[#FF6B6B] font-bold h-12 text-base rounded-xl shadow-[0_0_20px_rgba(230,57,70,0.2)] hover:shadow-[0_0_30px_rgba(230,57,70,0.4)] transition-all"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-[#FF6B6B] font-medium">
            Sign In
          </Link>
        </p>
      </motion.div>
    </AuthBackground>
  );
}
