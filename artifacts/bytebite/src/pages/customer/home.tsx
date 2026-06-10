import { useListRestaurants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Star, Clock, ChevronDown, Search as SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/home/search-bar";
import { CategoryChips } from "@/components/home/category-chips";
import { StatsBanner } from "@/components/home/stats-banner";
import { PopularSection } from "@/components/home/popular-section";
import { useState, useCallback } from "react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop",
];

function RestaurantCard({ restaurant, index }: { restaurant: any; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={`/menu/${restaurant.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        className="group cursor-pointer bg-[#111111] border border-white/10 hover:border-primary/40 rounded-2xl overflow-hidden transition-colors duration-300 shadow-xl hover:shadow-[0_8px_40px_rgba(230,57,70,0.12)] will-change-transform"
      >
        <div className="aspect-[16/10] w-full overflow-hidden bg-[#0A0A0A] relative">
          <img
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />

          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#0A0A0A]/80 backdrop-blur-sm border border-white/10 text-primary px-2.5 py-1 rounded-lg text-sm font-bold">
            <Star className="w-3.5 h-3.5 fill-primary" />
            {restaurant.rating}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg leading-tight">{restaurant.name}</h3>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{restaurant.description}</p>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-400" /> {restaurant.deliveryTime} mins
            </span>
            <span className="px-2.5 py-1 bg-zinc-800/80 border border-white/5 rounded-full text-xs font-medium text-zinc-300">
              {restaurant.cuisineType}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function CustomerHome() {
  const { data: restaurants, isLoading } = useListRestaurants();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.15]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const overlayOpacity = useTransform(scrollY, [0, 400], [0.5, 0.9]);

  const scrollToGrid = () => {
    document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);

  const filtered = (restaurants || []).filter((r) => {
    const matchSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisineType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !activeCategory || r.cuisineType === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white w-full">
      {/* Hero with real food imagery */}
      <section className="relative h-[100vh] w-full flex flex-col items-center justify-center overflow-hidden -mt-16">
        {/* Background food collage */}
        <motion.div className="absolute inset-0 z-0" style={{ scale: heroScale }}>
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 opacity-30">
            {HERO_IMAGES.map((src, i) => (
              <motion.div
                key={i}
                className="overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.2, duration: 1 }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </motion.div>
            ))}
            <div className="bg-[#0A0A0A]" />
          </div>
        </motion.div>

        {/* Dark overlay */}
        <motion.div className="absolute inset-0 bg-[#0A0A0A] z-[1]" style={{ opacity: overlayOpacity }} />

        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-[120px] z-[2] pointer-events-none" />

        {/* Content */}
        <motion.div className="relative z-10 text-center space-y-6 max-w-4xl px-4" style={{ opacity: heroOpacity }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-sm sm:text-base text-primary font-bold uppercase tracking-[0.2em] mb-4">Food delivery, reimagined</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] uppercase text-white">
              Fuel the night.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#FF6B6B]">
                Order in seconds.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-zinc-400 font-medium tracking-tight max-w-2xl mx-auto"
          >
            Real kitchens. Real delivery. Right now.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-zinc-600"
          >
            Trusted by 1,000+ users across 50+ restaurants
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="pt-6"
          >
            <button
              onClick={scrollToGrid}
              className="group inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF6B6B] transition-all shadow-[0_0_40px_rgba(230,57,70,0.25)] hover:shadow-[0_0_60px_rgba(230,57,70,0.35)]"
            >
              Browse Restaurants
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent z-[3]" />
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <StatsBanner />
      </section>

      {/* Discover */}
      <section id="discover" className="container mx-auto px-4 pt-16 pb-24 space-y-10 scroll-mt-20">
        <div className="space-y-6">
          <SearchBar restaurants={restaurants || []} onSearch={handleSearch} />
          <CategoryChips active={activeCategory} onSelect={setActiveCategory} />
        </div>

        {!searchQuery && !activeCategory && restaurants && restaurants.length > 0 && (
          <PopularSection restaurants={restaurants as any} />
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {searchQuery || activeCategory ? "Results" : "All Restaurants"}
            {filtered.length > 0 && (
              <span className="text-sm text-zinc-500 font-normal ml-3">{filtered.length} available</span>
            )}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full bg-zinc-800/50" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-zinc-800/50 rounded" />
                    <Skeleton className="h-4 w-full bg-zinc-800/30 rounded" />
                    <Skeleton className="h-4 w-1/2 bg-zinc-800/30 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-[#111111]/30">
              <SearchIcon className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <p className="text-lg font-bold text-zinc-500">No restaurants found</p>
              <p className="text-zinc-600 mt-1">Try a different search or category</p>
              {(searchQuery || activeCategory) && (
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory(""); }}
                  className="text-primary text-sm font-bold mt-4 hover:text-[#FF6B6B] transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
              {filtered.map((restaurant, i) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
