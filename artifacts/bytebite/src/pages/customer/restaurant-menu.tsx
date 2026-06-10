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
      <div className="bg-[#FAFAF8] min-h-screen -mt-16 pt-16">
        <Skeleton className="h-72 w-full bg-gray-200" />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48 bg-gray-100 rounded-lg" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-24 bg-gray-100 rounded-full" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="bg-[#FAFAF8] min-h-screen flex items-center justify-center -mt-16 pt-16">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-400">Restaurant not found</p>
          <Link href="/" className="text-[#E63946] text-sm font-bold mt-4 inline-block">Back to home</Link>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(restaurant.menuItems.map((i) => i.category)));

  const scrollTo = (cat: string) => {
    setActiveCategory(cat);
    document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const qty = (itemId: number) =>
    cartRestaurantId === restaurant.id ? cart.find((c) => c.menuItemId === itemId)?.quantity || 0 : 0;

  const handleAdd = (item: any) =>
    addToCart({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }, restaurant.id, restaurant.name);

  const handleRemove = (itemId: number) => {
    const c = cart.find((c) => c.menuItemId === itemId);
    if (c && c.quantity > 1) addToCart({ ...c, quantity: -1 }, restaurant.id, restaurant.name);
    else removeFromCart(itemId);
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen -mt-16">
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        <img
          src={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&fit=crop"}
          alt={restaurant.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute top-20 left-4 sm:left-8 z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">{restaurant.name}</h1>
            <p className="text-white/70 text-sm sm:text-base mt-2 max-w-xl">{restaurant.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 bg-white text-[#E63946] px-3 py-1.5 rounded-lg text-sm font-bold shadow">
                <Star className="w-4 h-4 fill-[#E63946]" /> {restaurant.rating}
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <Clock className="w-4 h-4" /> {restaurant.deliveryTime} min delivery
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin className="w-4 h-4" /> {restaurant.cuisineType}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24">
        {/* Category Tabs */}
        <div
          className="sticky top-16 z-40 bg-[#FAFAF8]/95 backdrop-blur-xl border-b border-gray-200 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => scrollTo(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-[#E63946] text-white shadow-md shadow-[#E63946]/20"
                  : "bg-white text-gray-500 border border-gray-200 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-12 pt-8">
          {categories.map((category) => {
            const items = restaurant.menuItems.filter((i) => i.category === category);
            return (
              <div key={category} id={`cat-${category}`} className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-1 rounded-full">{items.length}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {items.map((item, idx) => {
                    const q = qty(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex gap-4 sm:gap-5 p-4 bg-white border border-gray-100 hover:border-[#E63946]/20 hover:shadow-md rounded-2xl transition-all group"
                      >
                        {/* Circular image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-4 border-gray-50 group-hover:border-[#E63946]/20 transition-colors shadow-sm self-center">
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
                              <h3 className="font-bold text-gray-900 text-base leading-tight">{item.name}</h3>
                              <span className="text-[#E63946] font-bold text-sm shrink-0">${(item.price / 100).toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mt-1.5">{item.description}</p>
                          </div>

                          <div className="mt-3">
                            {!item.available ? (
                              <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">Sold out</span>
                            ) : q === 0 ? (
                              <Button
                                size="sm"
                                className="h-8 px-4 text-xs font-bold bg-[#E63946] text-white hover:bg-[#d32f3c] rounded-full shadow-sm"
                                onClick={() => handleAdd(item)}
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" /> Add
                              </Button>
                            ) : (
                              <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full p-0.5">
                                <button
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                                  onClick={() => handleRemove(item.id)}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-gray-900">{q}</span>
                                <button
                                  className="w-8 h-8 flex items-center justify-center hover:bg-[#E63946]/10 rounded-full text-[#E63946] transition-colors"
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
    </div>
  );
}
