import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface Restaurant {
  id: number;
  name: string;
  cuisineType: string;
  rating: number;
}

export function SearchBar({ restaurants, onSearch }: { restaurants: Restaurant[]; onSearch: (q: string) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = query.length > 0
    ? restaurants.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.cuisineType.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className={`flex items-center gap-3 bg-[#111111]/80  border rounded-2xl px-5 h-14 transition-all duration-300 ${
        focused ? "border-primary/50 shadow-[0_0_30px_rgba(230,57,70,0.1)]" : "border-white/10"
      }`}>
        <Search className="w-5 h-5 text-zinc-500 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search restaurants, cuisines..."
          className="bg-transparent flex-1 text-white placeholder:text-zinc-500 outline-none text-sm"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            {matches.map((r) => (
              <button
                key={r.id}
                onMouseDown={() => setLocation(`/menu/${r.id}`)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-white text-sm">{r.name}</p>
                  <p className="text-xs text-zinc-500">{r.cuisineType}</p>
                </div>
                <span className="text-xs text-primary font-bold">{r.rating} ★</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
