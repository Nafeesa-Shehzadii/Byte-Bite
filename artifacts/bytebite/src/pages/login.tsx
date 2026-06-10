import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthBackground } from "@/components/auth/auth-background";
import { Navigation, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "restaurant") setLocation("/restaurant");
      else if (user.role === "driver") setLocation("/driver");
      else setLocation("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-primary mb-3">
            <Navigation className="w-7 h-7 fill-primary" />
            <span className="text-2xl font-extrabold tracking-tight">ByteBite</span>
          </div>
          <p className="text-zinc-400 text-sm">Sign in to your account</p>
          <p className="text-zinc-600 text-xs mt-1">Join 1,000+ food lovers</p>
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0A0A0A]/60 border-white/10 text-white placeholder:text-zinc-500 h-12 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#0A0A0A]/60 border-white/10 text-white placeholder:text-zinc-500 h-12 rounded-xl pr-12 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white hover:bg-[#FF6B6B] font-bold h-12 text-base rounded-xl shadow-[0_0_20px_rgba(230,57,70,0.2)] hover:shadow-[0_0_30px_rgba(230,57,70,0.4)] transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:text-[#FF6B6B] font-medium">
            Register
          </Link>
        </p>
      </motion.div>
    </AuthBackground>
  );
}
