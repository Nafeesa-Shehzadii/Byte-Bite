import { useListRestaurants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerHome() {
  const { data: restaurants, isLoading } = useListRestaurants();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 w-full rounded-2xl bg-white/5 border border-white/10" />)}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight">Craving something?</h1>
        <p className="text-zinc-400 text-xl">Real-time delivery from the city's finest kitchens.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants?.map((restaurant, i) => (
          <Link key={restaurant.id} href={`/menu/${restaurant.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group cursor-pointer bg-zinc-900/40 backdrop-blur-md border border-white/10 hover:border-amber-500/50 hover:bg-zinc-900/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-800 relative">
                <img 
                  src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"} 
                  alt={restaurant.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">{restaurant.name}</h3>
                  <div className="flex items-center gap-1 bg-zinc-950/80 backdrop-blur border border-white/10 text-amber-400 px-2 py-1 rounded-md text-sm font-bold shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
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
    </div>
  );
}