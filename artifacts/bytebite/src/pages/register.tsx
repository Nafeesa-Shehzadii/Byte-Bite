import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Navigation className="w-8 h-8 fill-primary" />
            <span className="text-3xl font-extrabold tracking-tight">ByteBite</span>
          </div>
          <p className="text-zinc-400">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-500 h-12"
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-500 h-12"
          />
          <Input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="bg-[#111111] border-white/10 text-white placeholder:text-zinc-500 h-12"
          />

          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="bg-[#111111] border-white/10 text-zinc-100 h-12">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-white/10 text-zinc-100">
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="restaurant">Restaurant Owner</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white hover:bg-[#FF6B6B] font-bold h-12 text-base shadow-[0_0_20px_rgba(230,57,70,0.2)] hover:shadow-[0_0_30px_rgba(230,57,70,0.4)]"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-[#FF6B6B] font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
