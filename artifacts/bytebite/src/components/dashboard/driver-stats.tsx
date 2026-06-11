import { DollarSign, Package, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Order { id: number; total: number; status: string; }

export function DriverStats({ orders }: { orders: Order[] }) {
  const delivered = orders.filter((o) => o.status === "delivered");
  const earnings = delivered.reduce((a, o) => a + o.total, 0);
  const active = orders.filter((o) => o.status !== "delivered").length;

  const stats = [
    { icon: DollarSign, label: "Earnings", value: `$${earnings.toFixed(2)}`, color: "text-[#E63946]", bg: "bg-[#E63946]/10" },
    { icon: Package, label: "Delivered", value: String(delivered.length), color: "text-[#2EC4B6]", bg: "bg-[#2EC4B6]/10" },
    { icon: TrendingUp, label: "Active", value: String(active), color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="bg-[#141414] border border-white/[0.08] rounded-2xl p-4 sm:p-5 text-center">
          <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
