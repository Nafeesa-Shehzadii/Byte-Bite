import { useGetRestaurant } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/hooks/use-store";

export default function RestaurantMenu() {
  const { id } = useParams();
  const { data: restaurant, isLoading } = useGetRestaurant(Number(id), { query: { enabled: !!id }});
  const { addToCart, cartRestaurantId, cart } = useAppStore();

  if (isLoading) {
    return <div className="space-y-8 max-w-5xl mx-auto">
      <Skeleton className="h-64 w-full bg-white/5 rounded-3xl border border-white/10" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 bg-white/5 rounded-2xl border border-white/10" />)}
      </div>
    </div>;
  }

  if (!restaurant) return <div className="text-center py-20 text-zinc-500">Restaurant not found</div>;

  const categories = Array.from(new Set(restaurant.menuItems.map(item => item.category)));

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to spots
      </Link>
      
      <div className="relative rounded-3xl overflow-hidden min-h-[320px] border border-white/10 bg-zinc-900 shadow-2xl">
        <img 
          src={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"} 
          alt={restaurant.name} 
          className="absolute inset-0 w-full h-full object-cover opacity-40" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl">{restaurant.name}</h1>
            <div className="flex gap-3">
              <span className="flex items-center gap-1.5 bg-amber-500 text-zinc-950 px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                <Star className="w-4 h-4 fill-zinc-950" /> {restaurant.rating}
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg text-sm font-medium">
                <Clock className="w-4 h-4 text-amber-500" /> {restaurant.deliveryTime} mins
              </span>
            </div>
          </div>
          <p className="text-zinc-300 text-lg max-w-2xl leading-relaxed">{restaurant.description}</p>
        </div>
      </div>

      <div className="space-y-16">
        {categories.map((category, catIdx) => {
          const items = restaurant.menuItems.filter(i => i.category === category);
          return (
            <div key={category} className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight inline-block border-b-2 border-amber-500 pb-2">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {items.map((item, itemIdx) => {
                  const inCartCount = cartRestaurantId === restaurant.id 
                    ? cart.find(c => c.menuItemId === item.id)?.quantity || 0 
                    : 0;

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIdx * 0.1 + itemIdx * 0.05, duration: 0.4 }}
                      key={item.id} 
                      className={`flex gap-5 p-5 bg-zinc-900/30 backdrop-blur-sm border ${inCartCount > 0 ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5 hover:border-white/20'} rounded-2xl transition-all duration-300 group`}
                    >
                      <div className="flex-1 space-y-3 flex flex-col">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-lg leading-tight group-hover:text-amber-400 transition-colors">{item.name}</h3>
                          <span className="font-mono font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded shrink-0">
                            ${(item.price / 100).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed flex-1">{item.description}</p>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className={`mt-auto w-fit text-xs font-semibold shadow-md transition-all ${inCartCount > 0 ? 'bg-amber-500 text-zinc-950 hover:bg-amber-600' : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white'}`}
                          onClick={() => addToCart({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }, restaurant.id, restaurant.name)}
                          disabled={!item.available}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" /> 
                          {inCartCount > 0 ? `Add another (${inCartCount} in cart)` : 'Add to order'}
                        </Button>
                      </div>
                      {item.imageUrl && (
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-zinc-800 border border-white/5 relative">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          {!item.available && (
                            <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="text-xs font-bold text-white uppercase tracking-wider px-2 py-1 bg-zinc-900/80 rounded">Sold Out</span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}