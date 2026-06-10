import { useListRestaurants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, Clock, ArrowRight, ShoppingBag, Truck, UtensilsCrossed, Search as SearchIcon, ChefHat, Shield, Headphones, Quote, MapPin, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";

const HERO_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=900&fit=crop&q=90";

const FEATURED = [
  { name: "Grilled Salmon", price: "$24.99", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop", tag: "Seafood" },
  { name: "Wagyu Burger", price: "$17.99", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop", tag: "American" },
  { name: "Tonkotsu Ramen", price: "$15.99", img: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=400&fit=crop", tag: "Japanese" },
  { name: "Margherita Pizza", price: "$14.99", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop", tag: "Italian" },
];

const STEPS = [
  { icon: UtensilsCrossed, title: "Choose Restaurant", desc: "Browse our curated collection of local restaurants and explore their full menus." },
  { icon: ShoppingBag, title: "Place Your Order", desc: "Customize your meal, add items to your cart, and checkout with a single tap." },
  { icon: Truck, title: "Fast Delivery", desc: "Track your order in real time from the kitchen straight to your door." },
];

const WHY_US = [
  { icon: ChefHat, title: "Premium Quality", desc: "Partnered with top-rated restaurants that maintain the highest food standards." },
  { icon: Shield, title: "Secure Payments", desc: "Your transactions are protected with industry-standard encryption." },
  { icon: Headphones, title: "24/7 Support", desc: "Our team is always here to help with orders, delivery, or anything else." },
];

const TESTIMONIALS = [
  { name: "Sarah Mitchell", role: "Regular Customer", text: "ByteBite has completely changed how I order food. The real-time tracking is incredibly accurate and the restaurant selection is excellent." },
  { name: "James Rodriguez", role: "Restaurant Owner", text: "Since listing on ByteBite, our delivery orders increased by 40%. The kitchen dashboard makes managing orders effortless." },
  { name: "Priya Sharma", role: "Delivery Driver", text: "The driver app is intuitive and the route assignments are fair. Best delivery platform I have worked with so far." },
];

const CUISINES = ["All", "American", "Japanese", "Italian", "Mexican", "Indian", "Chinese", "Thai"];

function RestaurantCard({ restaurant, index }: { restaurant: any; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-80, 80], [3, -3]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-80, 80], [-3, 3]), { stiffness: 300, damping: 30 });

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
        className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-shadow duration-300 will-change-transform"
      >
        <div className="aspect-[16/10] w-full overflow-hidden relative">
          <img
            src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop"}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#E63946] px-2.5 py-1 rounded-lg text-sm font-bold shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#E63946]" />
            {restaurant.rating}
          </div>
        </div>
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#E63946] transition-colors">{restaurant.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{restaurant.description}</p>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {restaurant.deliveryTime} min</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>{restaurant.cuisineType}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#E63946] group-hover:translate-x-1 transition-all" />
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

  const filtered = (restaurants || []).filter((r) => {
    const matchSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisineType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = !activeCategory || r.cuisineType === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="bg-[#FAFAF8] text-gray-900 w-full -mt-16">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[85vh] py-12 lg:py-0">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="inline-block bg-[#E63946]/10 text-[#E63946] text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full">
                #1 Food Delivery Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-gray-900">
                The Best Quality{" "}
                <span className="text-[#E63946]">Food</span>{" "}
                Delivered To Your Door.
              </h1>
              <p className="text-gray-500 text-base sm:text-lg max-w-lg leading-relaxed">
                Order from the finest local restaurants. Fresh ingredients, real kitchens, and lightning-fast delivery every time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold h-14 px-8 rounded-full text-base shadow-lg shadow-[#E63946]/20"
                  onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Order Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 font-medium h-14 px-8 rounded-full text-base"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                >
                  How It Works
                </Button>
              </div>
              {/* Mini stats */}
              <div className="flex items-center gap-8 pt-4">
                {[
                  { val: "500+", label: "Orders Delivered" },
                  { val: "50+", label: "Restaurants" },
                  { val: "4.8", label: "Avg Rating" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-gray-900">{s.val}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="absolute w-80 h-80 sm:w-[420px] sm:h-[420px] bg-[#E63946]/10 rounded-full blur-[80px]" />
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px]">
                <img src={HERO_IMG} alt="Featured dish" className="w-full h-full object-cover rounded-full shadow-2xl border-8 border-white" />
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-2 -left-6 sm:-left-10 bg-white rounded-2xl px-5 py-3 shadow-lg border border-gray-100"
                >
                  <p className="text-[10px] text-gray-400 font-medium">Delivery in</p>
                  <p className="text-lg font-black text-gray-900">25 min</p>
                </motion.div>
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-2 -right-2 sm:-right-6 bg-white rounded-2xl px-5 py-3 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#E63946] text-[#E63946]" />
                    <span className="text-lg font-black text-gray-900">4.8</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Top Rated</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED DISHES ═══════════ */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.15em] mb-2">Crowd Favorites</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Popular Right Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {FEATURED.map((dish, i) => (
              <motion.div
                key={dish.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group text-center space-y-4"
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-full overflow-hidden border-4 border-gray-100 group-hover:border-[#E63946]/30 transition-colors shadow-md">
                  <img src={dish.img} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#E63946] uppercase tracking-wider">{dish.tag}</span>
                  <h3 className="font-bold text-gray-900 mt-0.5">{dish.name}</h3>
                  <p className="text-[#E63946] font-bold text-sm mt-1">{dish.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-20 bg-[#FAFAF8]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.15em] mb-2">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-[#E63946]/10 rounded-2xl flex items-center justify-center mx-auto">
                  <step.icon className="w-7 h-7 text-[#E63946]" />
                </div>
                <span className="text-xs text-gray-300 font-bold">0{i + 1}</span>
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ RESTAURANTS ═══════════ */}
      <section id="restaurants" className="py-20 bg-white border-t border-gray-100 scroll-mt-20">
        <div className="container mx-auto px-4 space-y-10">
          <div className="text-center">
            <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.15em] mb-2">Explore</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Our Restaurants</h2>
          </div>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#E63946]/40 focus:ring-2 focus:ring-[#E63946]/10 text-sm"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 justify-center flex-wrap">
            {CUISINES.map((cat) => {
              const isActive = activeCategory === cat || (cat === "All" && !activeCategory);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === "All" ? "" : cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#E63946] text-white shadow-md shadow-[#E63946]/20"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <Skeleton className="aspect-[16/10] w-full bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-gray-100 rounded" />
                    <Skeleton className="h-4 w-full bg-gray-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <SearchIcon className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-400">No restaurants found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
              {(searchQuery || activeCategory) && (
                <button onClick={() => { setSearchQuery(""); setActiveCategory(""); }} className="text-[#E63946] text-sm font-bold mt-3">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
              {filtered.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ WHY CHOOSE US ═══════════ */}
      <section className="py-20 bg-[#FAFAF8] border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.15em] mb-2">Why ByteBite</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Why Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {WHY_US.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-14 h-14 bg-[#E63946]/10 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-6 h-6 text-[#E63946]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.15em] mb-2">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">What People Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-[#FAFAF8] rounded-2xl p-8 border border-gray-100"
              >
                <Quote className="w-8 h-8 text-[#E63946]/20 mb-4" />
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{t.text}</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section id="about" className="py-20 bg-[#FAFAF8] border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden aspect-[4/3]"
            >
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=500&fit=crop"
                alt="About ByteBite"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.15em]">About Us</p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                We Connect You With The Best Local Restaurants
              </h2>
              <p className="text-gray-500 leading-relaxed">
                ByteBite was built with a single mission: make food ordering seamless, fast, and delightful. We partner with the highest-rated local kitchens to bring you restaurant-quality meals delivered to your doorstep in minutes.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Our platform serves three communities: customers who love great food, restaurant owners who want to grow their business, and drivers who value fair, flexible work.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <p className="text-3xl font-black text-[#E63946]">500+</p>
                  <p className="text-sm text-gray-400">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900">99%</p>
                  <p className="text-sm text-gray-400">On-time Delivery</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT / CTA ═══════════ */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.15em]">Get In Touch</p>
              <h2 className="text-3xl font-black">Have Questions? We Are Here To Help.</h2>
              <p className="text-gray-400 leading-relaxed text-sm">
                Whether you are a customer, restaurant partner, or driver, our team is ready to assist you.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-[#E63946]" /> San Francisco, CA 94102
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-[#E63946]" /> support@bytebite.app
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone className="w-4 h-4 text-[#E63946]" /> +1 (555) 123-4567
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center text-center space-y-6 bg-gray-800/50 rounded-3xl p-8 border border-white/5">
              <h3 className="text-2xl font-bold">Ready to get started?</h3>
              <p className="text-gray-400 text-sm max-w-xs">Join thousands of food lovers and order your first meal today.</p>
              <Link href="/register">
                <Button size="lg" className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold h-14 px-10 rounded-full shadow-lg shadow-[#E63946]/20">
                  Create Account <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-10 bg-gray-950 text-gray-500 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">ByteBite. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#restaurants" className="hover:text-white transition-colors">Restaurants</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
