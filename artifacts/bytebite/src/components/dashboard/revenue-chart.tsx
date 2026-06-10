import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

interface Order { id: number; total: number; createdAt: string; paymentStatus: string; }

export function RevenueChart({ orders }: { orders: Order[] }) {
  const data = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const o of orders) {
      if (o.paymentStatus !== "paid") continue;
      const day = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      byDay[day] = (byDay[day] || 0) + o.total;
    }
    return Object.entries(byDay).slice(-7).map(([day, revenue]) => ({ day, revenue: Math.round(revenue * 100) / 100 }));
  }, [orders]);

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
        <p className="text-gray-400 text-sm">No revenue data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E63946" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#E63946" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `$${v}`} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, color: "#111", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke="#E63946" strokeWidth={2} fill="url(#revGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
