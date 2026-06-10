import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Zap, Store, Star } from "lucide-react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

const stats = [
  { icon: Zap, label: "Orders Delivered", value: 500, suffix: "+", color: "text-primary" },
  { icon: Store, label: "Restaurants", value: 50, suffix: "+", color: "text-[#2EC4B6]" },
  { icon: Star, label: "Avg Rating", value: 4.8, suffix: "", color: "text-yellow-400", isDecimal: true },
];

export function StatsBanner() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.15, duration: 0.5 }}
          className="bg-[#111111]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 sm:p-6 text-center"
        >
          <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} mx-auto mb-2`} />
          <div className={`text-2xl sm:text-3xl font-black ${stat.color} tracking-tight`}>
            {stat.isDecimal ? stat.value : <AnimatedNumber value={stat.value} suffix={stat.suffix} />}
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
