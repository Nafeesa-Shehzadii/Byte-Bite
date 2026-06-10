import { useGetRestaurant, getGetRestaurantQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Star, Clock, MapPin, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/hooks/use-store";
import { useState, useEffect } from "react";

export default function RestaurantMenu() {
  const { id } = useParams();
  const { data: restaurant, isLoading } = useGetRestaurant(Number(id), {
    query: { enabled: !!id, queryKey: getGetRestaurantQueryKey(Number(id)) },
  });
  const { addToCart, removeFromCart, cartRestaurantId, cart } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>("");

  useEffect(() => {
    if (restaurant && restaurant.menuItems.length > 0 && !activeCategory) {
      setActiveCategory(restaurant.menuItems[0].category);
    }
  }, [restaurant]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-72 w-full bg-[#141414] rounded-3xl" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24 bg-[#141414] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 bg-[#141414] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-lg font-bold text-zinc-500">Restaurant not found</p>
        <Link href="/" className="text-primary text-sm font-bold mt-4 inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  const categories = Array.from(new Set(restaurant.menuItems.map((item) => item.category)));

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getCartQty = (itemId: number) =>
    cartRestaurantId === restaurant.id ? cart.find((c) => c.menuItemId === itemId)?.quantity || 0 : 0;

  const handleAdd = (item: any) => {
    addToCart({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }, restaurant.id, restaurant.name);
  };

  const handleRemove = (itemId: number) => {
    const inCart = cart.find((c) => c.menuItemId === itemId);
    if (inCart && inCart.quantity > 1) {
      addToCart({ ...inCart, quantity: -1 }, restaurant.id, restaurant.name);
    } else {
      removeFromCart(itemId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 px-4 pt-6">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors font-medium text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to restaurants
      </Link>

      {/* Restaurant Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden bg-[#141414] border border-white/[0.06] mb-10"
      >
        <div className="relative h-56 sm:h-72 lg:h-80">
          <img
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&fit=crop"}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-black/20" />
        </div>
        <div className="relative px-6 sm:px-10 pb-8 -mt-16 z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {restaurant.name}
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
                {restaurant.description}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">
                <Star className="w-4 h-4 fill-white" /> {restaurant.rating}
              </div>
              <div className="flex items-center gap-1.5 bg-[#0A0A0A] border border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-zinc-300">
                <Clock className="w-4 h-4 text-primary" /> {restaurant.deliveryTime} min
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-zinc-600">
            <MapPin className="w-3.5 h-3.5" />
            <span>{restaurant.cuisineType} Cuisine</span>
            <span className="text-zinc-700">|</span>
            <span>{restaurant.menuItems.length} items on menu</span>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div
        className="sticky top-16 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/[0.06] -mx-4 px-4 py-3 flex gap-2 overflow-x-auto mb-8"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => scrollToCategory(cat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeCategory === cat
                ? "bg-primary text-white shadow-[0_0_15px_rgba(230,57,70,0.25)]"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items by Category */}
      <div className="space-y-14">
        {categories.map((category) => {
          const items = restaurant.menuItems.filter((i) => i.category === category);
          return (
            <div key={category} id={`cat-${category}`} className="scroll-mt-32">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                {category}
                <span className="text-xs text-zinc-600 font-medium">{items.length} items</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map((item, idx) => {
                  const qty = getCartQty(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04, duration: 0.4 }}
                      className="flex gap-4 sm:gap-5 p-4 bg-[#141414] border border-white/[0.06] hover:border-primary/20 rounded-2xl transition-colors group"
                    >
                      {/* Circular food image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-2 border-white/[0.06] group-hover:border-primary/30 transition-colors bg-[#0A0A0A] self-center">
                        <img
                          src={item.imageUrl || restaurant.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-white text-base leading-tight truncate">{item.name}</h3>
                            <span className="text-primary font-bold text-sm font-mono shrink-0">
                              ${(item.price / 100).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mt-1.5">
                            {item.description}
                          </p>
                        </div>

                        {/* Add to cart controls */}
                        <div className="mt-3">
                          {!item.available ? (
                            <span className="text-xs text-zinc-600 font-medium">Unavailable</span>
                          ) : qty === 0 ? (
                            <Button
                              size="sm"
                              className="h-8 px-4 text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 hover:border-primary rounded-lg transition-all"
                              onClick={() => handleAdd(item)}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Add
                            </Button>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-[#0A0A0A] border border-white/10 rounded-lg p-0.5">
                              <button
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-md text-zinc-400 hover:text-white transition-colors"
                                onClick={() => handleRemove(item.id)}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-white">{qty}</span>
                              <button
                                className="w-8 h-8 flex items-center justify-center hover:bg-primary/20 rounded-md text-primary transition-colors"
                                onClick={() => handleAdd(item)}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
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
