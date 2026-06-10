import { useGetRestaurant, getGetRestaurantQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Star, Clock, MapPin, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { useAppStore } from "@/hooks/use-store";
import { useState, useEffect } from "react";

const glass = "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]";

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
      <div className="bg-[#0C0C0C] min-h-screen -mt-16 pt-24">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <Skeleton className="h-[60vh] w-full bg-white/[0.04] rounded-3xl" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-24 bg-white/[0.04] rounded-full" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28 bg-white/[0.04] rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="bg-[#0C0C0C] min-h-screen flex items-center justify-center -mt-16 pt-16">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-500">Restaurant not found</p>
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
  const qty = (itemId: number) => cartRestaurantId === restaurant.id ? cart.find((c) => c.menuItemId === itemId)?.quantity || 0 : 0;
  const handleAdd = (item: any) => addToCart({ menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }, restaurant.id, restaurant.name);
  const handleRemove = (itemId: number) => {
    const c = cart.find((c) => c.menuItemId === itemId);
    if (c && c.quantity > 1) addToCart({ ...c, quantity: -1 }, restaurant.id, restaurant.name);
    else removeFromCart(itemId);
  };

  return (
    <div className="bg-[#0C0C0C] -mt-16">
      {/* Scroll-to-expand hero with restaurant image */}
      <ScrollExpandMedia
        mediaSrc={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&fit=crop"}
        bgImageSrc={restaurant.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&fit=crop"}
        title={restaurant.name}
        subtitle={`${restaurant.cuisineType} Cuisine`}
        scrollToExpand="Scroll to explore menu"
      >
        {/* This content reveals after the image fully expands */}
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Restaurant info bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#E63946] transition-colors font-medium text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to restaurants
              </Link>
              <p className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed">{restaurant.description}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-[#E63946] text-white px-4 py-2 rounded-xl text-sm font-bold">
                <Star className="w-4 h-4 fill-white" /> {restaurant.rating}
              </div>
              <div className={`flex items-center gap-1.5 ${glass} px-4 py-2 rounded-xl text-sm font-medium text-gray-300`}>
                <Clock className="w-4 h-4 text-[#E63946]" /> {restaurant.deliveryTime} min
              </div>
              <div className={`flex items-center gap-1.5 ${glass} px-4 py-2 rounded-xl text-sm font-medium text-gray-300`}>
                <MapPin className="w-4 h-4 text-[#E63946]" /> {restaurant.cuisineType}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => scrollTo(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#E63946] text-white shadow-[0_0_20px_rgba(230,57,70,0.3)]"
                    : `${glass} text-gray-400 hover:text-white hover:bg-white/[0.08]`
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-14 pb-24">
            {categories.map((category) => {
              const items = restaurant.menuItems.filter((i) => i.category === category);
              return (
                <div key={category} id={`cat-${category}`} className="scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-bold text-white">{category}</h2>
                    <span className="text-xs text-gray-600 font-medium bg-white/[0.06] px-2.5 py-1 rounded-full">{items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {items.map((item, idx) => {
                      const q = qty(item.id);
                      return (
                        <motion.div key={item.id}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.04 }}
                          className={`flex gap-4 sm:gap-5 p-4 ${glass} hover:bg-white/[0.07] hover:border-white/[0.14] rounded-2xl transition-all group`}>
                          {/* Circular food image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-2 border-white/[0.06] group-hover:border-[#E63946]/30 transition-colors bg-white/[0.02] self-center">
                            <img src={item.imageUrl || restaurant.imageUrl} alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                          </div>
                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-white text-base leading-tight">{item.name}</h3>
                                <span className="text-[#E63946] font-bold text-sm shrink-0">${(item.price).toFixed(2)}</span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-1.5">{item.description}</p>
                            </div>
                            <div className="mt-3">
                              {!item.available ? (
                                <span className="text-xs text-gray-600 font-medium bg-white/[0.06] px-3 py-1 rounded-full">Sold out</span>
                              ) : q === 0 ? (
                                <Button size="sm"
                                  className="h-8 px-4 text-xs font-bold bg-[#E63946]/10 text-[#E63946] hover:bg-[#E63946] hover:text-white border border-[#E63946]/20 hover:border-[#E63946] rounded-lg transition-all"
                                  onClick={() => handleAdd(item)}>
                                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                </Button>
                              ) : (
                                <div className={`inline-flex items-center gap-1 ${glass} rounded-full p-0.5`}>
                                  <button className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.08] rounded-full text-gray-400 hover:text-white transition-colors"
                                    onClick={() => handleRemove(item.id)}>
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-bold text-white">{q}</span>
                                  <button className="w-8 h-8 flex items-center justify-center hover:bg-[#E63946]/20 rounded-full text-[#E63946] transition-colors"
                                    onClick={() => handleAdd(item)}>
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
      </ScrollExpandMedia>
    </div>
  );
}
