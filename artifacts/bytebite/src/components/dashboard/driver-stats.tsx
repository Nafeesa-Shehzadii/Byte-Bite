import { DollarSign, Package, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Order { id: number; total: number; status: string; }

export function DriverStats({ orders }: { orders: Order[] }) {
  const delivered = orders.filter((o) => o.status === "delivered");
  const earnings = delivered.reduce((a, o) => a + o.total, 0);
  const active = orders.filter((o) => o.status !== "delivered").length;

  const stats = [
    { icon: DollarSign, label: "Earnings", value: `$${earnings.toFixed(2)}`, color: "text-[#E63946]", bg: "bg-[#E63946]/10" },
    { icon: Package, label: "Delivered", value: String(delivered.length), color: "text-teal-600", bg: "bg-teal-50" },
    { icon: TrendingUp, label: "Active", value: String(active), color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 text-center shadow-sm">
          <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
