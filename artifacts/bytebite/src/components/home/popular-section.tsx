import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, TrendingUp } from "lucide-react";

interface Restaurant {
  id: number;
  name: string;
  imageUrl: string;
  cuisineType: string;
  rating: number;
  deliveryTime: number;
}

export function PopularSection({ restaurants }: { restaurants: Restaurant[] }) {
  const popular = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 6);
  if (popular.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-white tracking-tight">Trending Now</h2>
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {popular.map((r, i) => (
          <Link key={r.id} href={`/menu/${r.id}`}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="snap-start shrink-0 w-64 sm:w-72 group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#111111] border border-white/10 group-hover:border-primary/40 transition-all">
                <img
                  src={r.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&fit=crop"}
                  alt={r.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Popular
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white text-lg leading-tight">{r.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1 text-primary font-bold">
                      <Star className="w-3 h-3 fill-primary" /> {r.rating}
                    </span>
                    <span>{r.cuisineType}</span>
                    <span>{r.deliveryTime} min</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
