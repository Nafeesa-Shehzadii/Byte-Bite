import { formatDistanceToNow } from "date-fns";

const STATUS_DOT: Record<string, string> = {
  placed: "bg-yellow-400",
  accepted: "bg-blue-400",
  cooking: "bg-orange-400",
  ready: "bg-[#2EC4B6]",
  delivered: "bg-emerald-400",
  assigned: "bg-purple-400",
};

interface Order {
  id: number;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
}

export function OrderTimeline({ orders }: { orders: Order[] }) {
  const recent = orders.slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 text-center">
        <p className="text-zinc-600 text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 sm:p-6">
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Recent Activity</h3>
      <div className="space-y-0">
        {recent.map((o, i) => (
          <div key={o.id} className="flex gap-3 relative">
            {/* Vertical line */}
            {i < recent.length - 1 && (
              <div className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-white/5" />
            )}
            {/* Dot */}
            <div className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${STATUS_DOT[o.status] || "bg-zinc-600"}`} />
            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-white font-medium truncate">
                  #{o.id} · {o.customerName}
                </p>
                <span className="text-xs text-primary font-mono shrink-0">${(o.total / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-zinc-500 capitalize">{o.status}</span>
                <span className="text-[10px] text-zinc-600">
                  {formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
