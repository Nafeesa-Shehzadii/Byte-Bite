import { useListRestaurants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Clock, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef } from "react";

const PARTICLES = ["🧅", "🧄", "🥩", "🧀", "🫙", "🥬", "🍅", "🥓", "🍄", "🌶️"];

export default function CustomerHome() {
  const { data: restaurants, isLoading } = useListRestaurants();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const burgerScale = useTransform(scrollY, [0, 500], [1, 3]);
  const burgerOpacity = useTransform(scrollY, [0, 400, 600], [1, 1, 0]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const scrollToGrid = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white w-full">
      {/* Hero Section */}
      <section className="relative h-[100vh] w-full flex flex-col items-center justify-center overflow-hidden border-b border-white/10 -mt-16">
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl opacity-20"
              initial={{ 
                y: "110vh", 
                x: `${Math.random() * 100}vw`,
                rotate: Math.random() * 360 
              }}
              animate={{ 
                y: "-10vh", 
                rotate: Math.random() * 360 + 360 
              }}
              transition={{ 
                duration: 15 + Math.random() * 15, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 10
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* Centered Burger SVG/Emoji tied to scroll */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{ scale: burgerScale, opacity: burgerOpacity }}
        >
          <div className="text-[200px] leading-none drop-shadow-[0_0_50px_rgba(230,57,70,0.3)]">🍔</div>
        </motion.div>

        {/* Text Content */}
        <motion.div 
          className="relative z-10 text-center space-y-6 max-w-4xl px-4"
          style={{ opacity: heroOpacity }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] uppercase text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
            Fuel the night.<br />
            Order in seconds.
          </h1>
          <p className="text-xl md:text-3xl text-zinc-300 font-medium tracking-tight">
            Real kitchens. Real delivery. Right now.
          </p>
          <div className="pt-8">
            <button 
              onClick={scrollToGrid}
              className="group inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FF6B6B] transition-all shadow-[0_0_30px_rgba(230,57,70,0.3)]"
            >
              Browse Restaurants
              <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Restaurant Grid */}
      <section className="container mx-auto px-4 py-24" id="restaurants">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 w-full rounded-2xl bg-[#111111] border border-white/10" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants?.map((restaurant, i) => (
              <Link key={restaurant.id} href={`/menu/${restaurant.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="group cursor-pointer bg-[#111111] border border-white/10 hover:border-primary/50 hover:bg-zinc-900/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(230,57,70,0.15)]"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-[#0A0A0A] relative">
                    <img 
                      src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <h3 className="text-2xl font-bold text-white drop-shadow-md">{restaurant.name}</h3>
                      <div className="flex items-center gap-1 bg-[#0A0A0A]/80 backdrop-blur border border-white/10 text-primary px-2 py-1 rounded-md text-sm font-bold shadow-lg">
                        <Star className="w-3.5 h-3.5 fill-primary" />
                        {restaurant.rating}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{restaurant.description}</p>
                    <div className="flex items-center gap-4 text-sm text-zinc-500 pt-1">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-400" /> {restaurant.deliveryTime} mins</span>
                      <span className="px-2.5 py-1 bg-zinc-800 border border-white/5 rounded-full text-xs font-medium text-zinc-300 tracking-wide">{restaurant.cuisineType}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
