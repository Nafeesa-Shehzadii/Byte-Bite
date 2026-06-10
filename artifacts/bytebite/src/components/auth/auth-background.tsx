import { motion } from "framer-motion";

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] relative overflow-hidden flex items-center justify-center px-4">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            initial={{
              y: `${30 + Math.random() * 40}%`,
              x: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [`${30 + Math.random() * 40}%`, `${15 + Math.random() * 30}%`],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
