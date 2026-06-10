import { useListRestaurants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, Clock, ArrowRight, ShoppingBag, Truck, UtensilsCrossed, Search as SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/home/search-bar";
import { CategoryChips } from "@/components/home/category-chips";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

const HERO_FOOD = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop&q=90";

const FEATURED_DISHES = [
  { name: "Grilled Salmon", price: "$24.99", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop" },
  { name: "Wagyu Burger", price: "$17.99", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop" },
  { name: "Tonkotsu Ramen", price: "$15.99", image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=400&fit=crop" },
  { name: "Margherita Pizza", price: "$14.99", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop" },
  { name: "Caesar Salad", price: "$10.99", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop" },
];

const HOW_IT_WORKS = [
  { icon: UtensilsCrossed, title: "Choose Restaurant", desc: "Browse our curated selection of local restaurants and their menus." },
  { icon: ShoppingBag, title: "Place Your Order", desc: "Add items to your cart, customize your meal, and checkout securely." },
  { icon: Truck, title: "Fast Delivery", desc: "Track your order in real time from kitchen to your doorstep." },
];

function RestaurantCard({ restaurant, index }: { restaurant: any; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-4, 4]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <Link href={`/menu/${restaurant.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08, duration: 0.5 }}
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        onMouseMove={handleMouse}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        className="group cursor-pointer bg-[#141414] border border-white/[0.06] hover:border-primary/30 rounded-2xl overflow-hidden transition-colors duration-300 will-change-transform"
      >
        <div className="aspect-[16/10] w-full overflow-hidden relative">
          <img
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop"}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 text-primary px-2.5 py-1 rounded-lg text-sm font-bold">
            <Star className="w-3.5 h-3.5 fill-primary" />
            {restaurant.rating}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white leading-tight">{restaurant.name}</h3>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{restaurant.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {restaurant.deliveryTime} min
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400 font-medium">{restaurant.cuisineType}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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

  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);

  const filtered = (restaurants || []).filter((r) => {
    const matchSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisineType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !activeCategory || r.cuisineType === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white w-full">
      {/* ── Hero: Split Layout ── */}
      <section className="relative min-h-[90vh] w-full overflow-hidden -mt-16 pt-16">
        <div className="container mx-auto px-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(90vh-64px)] py-12 lg:py-0">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 relative z-10"
            >
              <div className="space-y-6">
                <p className="text-sm text-primary font-bold uppercase tracking-[0.2em]">
                  Premium Food Delivery
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                  The Best Quality{" "}
                  <span className="text-primary">Food</span> Of Your Choice.
                </h1>
                <p className="text-zinc-400 text-base sm:text-lg max-w-md leading-relaxed">
                  Order from the finest local restaurants. Fresh ingredients,
                  real kitchens, delivered to your door in minutes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-[#c72d39] font-bold text-base h-14 px-8 rounded-xl shadow-[0_4px_30px_rgba(230,57,70,0.25)]"
                  onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}
                >
                  View Menu
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white font-medium text-base h-14 px-8 rounded-xl"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                >
                  How It Works
                </Button>
              </div>
              {/* Mini stats */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">500+</p>
                  <p className="text-xs text-zinc-500 font-medium">Orders Delivered</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">50+</p>
                  <p className="text-xs text-zinc-500 font-medium">Restaurants</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-primary">4.8</p>
                  <p className="text-xs text-zinc-500 font-medium">Avg Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Food Image */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px]">
                <img
                  src={HERO_FOOD}
                  alt="Featured dish"
                  className="w-full h-full object-cover rounded-full border-4 border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                />
                {/* Floating accent cards */}
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-8 sm:-left-12 bg-[#141414] border border-white/10 rounded-2xl px-5 py-3 shadow-xl"
                >
                  <p className="text-xs text-zinc-500">Delivery in</p>
                  <p className="text-lg font-black text-white">25 min</p>
                </motion.div>
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 sm:-right-8 bg-[#141414] border border-white/10 rounded-2xl px-5 py-3 shadow-xl"
                >
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="text-lg font-black text-white">4.8</span>
                  </div>
                  <p className="text-xs text-zinc-500">Top Rated</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Featured Dishes Carousel ── */}
      <section className="border-t border-white/[0.04] bg-[#0C0C0C] py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Popular Dishes</h2>
            <button
              onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm text-zinc-500 hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div
            className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x"
            style={{ scrollbarWidth: "none" }}
          >
            {FEATURED_DISHES.map((dish, i) => (
              <motion.div
                key={dish.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="snap-start shrink-0 w-48 sm:w-56 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-white/[0.06] group-hover:border-primary/40 transition-colors shadow-lg">
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{dish.name}</h3>
                    <p className="text-primary font-bold text-sm mt-1">{dish.price}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 border-t border-white/[0.04]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm text-primary font-bold uppercase tracking-[0.15em] mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Step {i + 1}</div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Discover Restaurants ── */}
      <section id="discover" className="container mx-auto px-4 pt-8 pb-24 space-y-10 scroll-mt-20 border-t border-white/[0.04]">
        <div className="text-center mb-4">
          <p className="text-sm text-primary font-bold uppercase tracking-[0.15em] mb-3">Explore</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Our Restaurants</h2>
        </div>

        <div className="space-y-6 max-w-xl mx-auto">
          <SearchBar restaurants={restaurants || []} onSearch={handleSearch} />
        </div>
        <CategoryChips active={activeCategory} onSelect={setActiveCategory} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#141414] rounded-2xl border border-white/[0.06] overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full bg-zinc-800/40" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-zinc-800/40 rounded" />
                  <Skeleton className="h-4 w-full bg-zinc-800/30 rounded" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-800/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/[0.06] rounded-2xl">
            <SearchIcon className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <p className="text-lg font-bold text-zinc-500">No restaurants found</p>
            <p className="text-zinc-600 mt-1 text-sm">Try a different search or category</p>
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
      </section>
    </div>
  );
}
