export function InitialsAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-20 h-20 text-xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary to-[#2EC4B6] flex items-center justify-center font-bold text-white shrink-0 ring-2 ring-white/10`}
    >
      {initials}
    </div>
  );
}
