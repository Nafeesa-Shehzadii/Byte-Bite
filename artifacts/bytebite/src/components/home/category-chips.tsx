const CATEGORIES = [
  "All",
  "American",
  "Japanese",
  "Italian",
  "Mexican",
  "Indian",
  "Chinese",
  "Thai",
  "Mediterranean",
  "Korean",
  "French",
];

export function CategoryChips({ active, onSelect }: { active: string; onSelect: (cat: string) => void }) {
  return (
    <div className="relative">
      <div
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat || (cat === "All" && !active);
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat === "All" ? "" : cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(230,57,70,0.3)]"
                  : "bg-[#111111] text-zinc-400 border border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <div className="absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none" />
    </div>
  );
}
