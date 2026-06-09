import { useGetRestaurant, getGetRestaurantQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/hooks/use-store";
import { useState, useRef, useEffect } from "react";

export default function RestaurantMenu() {
  const { id } = useParams();
  const { data: restaurant, isLoading } = useGetRestaurant(Number(id), { query: { enabled: !!id, queryKey: getGetRestaurantQueryKey(Number(id)) }});
  const { addToCart, cartRestaurantId, cart } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [flyingItems, setFlyingItems] = useState<{id: string, x: number, y: number, destX: number, destY: number}[]>([]);

  useEffect(() => {
    if (restaurant && restaurant.menuItems.length > 0 && !activeCategory) {
      setActiveCategory(restaurant.menuItems[0].category);
    }
  }, [restaurant]);

  if (isLoading) {
    return <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-64 w-full bg-[#111111] rounded-3xl border border-white/10" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 bg-[#111111] rounded-2xl border border-white/10" />)}
      </div>
    </div>;
  }

  if (!restaurant) return <div className="text-center py-20 text-zinc-500">Restaurant not found</div>;

  const categories = Array.from(new Set(restaurant.menuItems.map(item => item.category)));

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const el = document.getElementById(`category-${cat}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart state
    addToCart({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }, restaurant.id, restaurant.name);

    // Animation
    const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      const flyId = Math.random().toString(36);
      
      setFlyingItems(prev => [...prev, {
        id: flyId,
        x: buttonRect.left + buttonRect.width / 2,
        y: buttonRect.top + buttonRect.height / 2,
        destX: cartRect.left + cartRect.width / 2,
        destY: cartRect.top + cartRect.height / 2
      }]);

      setTimeout(() => {
        setFlyingItems(prev => prev.filter(f => f.id !== flyId));
      }, 800);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24 px-4 pt-8">
      {/* Flying animations */}
      {flyingItems.map(fly => (
        <motion.div
          key={fly.id}
          initial={{ x: fly.x, y: fly.y, scale: 1, opacity: 1 }}
          animate={{ x: fly.destX, y: fly.destY, scale: 0.2, opacity: 0.5 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="fixed z-[100] pointer-events-none text-4xl"
          style={{ top: 0, left: 0 }}
        >
          🍔
        </motion.div>
      ))}

      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to spots
      </Link>
      
      <div className="relative rounded-3xl overflow-hidden min-h-[320px] border border-white/10 bg-[#111111] shadow-2xl">
        <img 
          src={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"} 
          alt={restaurant.name} 
          className="absolute inset-0 w-full h-full object-cover opacity-40" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl text-white">{restaurant.name}</h1>
            <div className="flex gap-3">
              <span className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                <Star className="w-4 h-4 fill-white" /> {restaurant.rating}
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg text-sm font-medium text-white">
                <Clock className="w-4 h-4 text-primary" /> {restaurant.deliveryTime} mins
              </span>
            </div>
          </div>
          <p className="text-zinc-300 text-lg max-w-2xl leading-relaxed">{restaurant.description}</p>
        </div>
      </div>

      {/* Sticky Tab Bar */}
      <div className="sticky top-16 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10 -mx-4 px-4 py-3 flex gap-4 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => scrollToCategory(category)}
            className={`whitespace-nowrap px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeCategory === category ? 'border-primary text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-16 pt-4">
        {categories.map((category, catIdx) => {
          const items = restaurant.menuItems.filter(i => i.category === category);
          return (
            <div key={category} id={`category-${category}`} className="space-y-6 scroll-mt-32">
              <h2 className="text-2xl font-bold tracking-tight inline-block text-white">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {items.map((item, itemIdx) => {
                  const inCartCount = cartRestaurantId === restaurant.id 
                    ? cart.find(c => c.menuItemId === item.id)?.quantity || 0 
                    : 0;
                  
                  const ingredients: string[] = (item as any).ingredients || ["Secret Sauce", "Spices", "Love"];

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: itemIdx * 0.05, duration: 0.4 }}
                      key={item.id} 
                      className="relative w-full h-[180px] [perspective:1000px] group cursor-pointer"
                    >
                      <div className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-500 group-hover:[transform:rotateY(180deg)]">
                        {/* Front of card */}
                        <div className="absolute inset-0 [backface-visibility:hidden] flex gap-5 p-5 bg-[#111111] border border-white/5 rounded-2xl w-full h-full">
                          <div className="flex-1 space-y-3 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-lg leading-tight text-white">{item.name}</h3>
                                <span className="font-mono font-medium text-primary shrink-0">
                                  ${(item.price / 100).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mt-1">{item.description}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className={`w-fit text-xs font-semibold shadow-md transition-all ${inCartCount > 0 ? 'bg-primary text-white hover:bg-[#FF6B6B]' : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white'}`}
                              onClick={(e) => handleAddToCart(e, item)}
                              disabled={!item.available}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1.5" /> 
                              {inCartCount > 0 ? `Add another (${inCartCount})` : 'Add to order'}
                            </Button>
                          </div>
                          {item.imageUrl && (
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-zinc-800 border border-white/5 relative self-center">
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              {!item.available && (
                                <div className="absolute inset-0 bg-[#0A0A0A]/70 backdrop-blur-[2px] flex items-center justify-center">
                                  <span className="text-xs font-bold text-white uppercase tracking-wider px-2 py-1 bg-zinc-900/80 rounded">Sold Out</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Back of card */}
                        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col p-5 bg-[#111111] border border-primary/30 rounded-2xl w-full h-full justify-center">
                          <h4 className="text-white font-bold mb-3 text-sm tracking-wider uppercase">Ingredients</h4>
                          <div className="flex flex-wrap gap-2">
                            {ingredients.map((ing: string, i: number) => (
                              <span key={i} className="bg-[#2EC4B6]/10 text-[#2EC4B6] border border-[#2EC4B6]/20 px-3 py-1 rounded-full text-xs font-medium">
                                {ing}
                              </span>
                            ))}
                          </div>
                          <Button 
                            size="sm" 
                            className="mt-auto w-full bg-primary text-white hover:bg-[#FF6B6B] font-semibold"
                            onClick={(e) => handleAddToCart(e, item)}
                            disabled={!item.available}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add to Order
                          </Button>
                        </div>
                      </div>
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
