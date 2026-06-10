import { useListRestaurants } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, Clock, ArrowRight, ShoppingBag, Truck, UtensilsCrossed, Search as SearchIcon, ChefHat, Shield, Headphones, MapPin, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TestimonialCard } from "@/components/ui/testimonial-cards";
import { useState, useCallback, useEffect, useRef } from "react";

/* ────────────────────── DATA ────────────────────── */

const HERO_SLIDES = [
  { img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=1080&fit=crop&q=90", headline: "Savor Every Bite.", sub: "Premium meals from top-rated local kitchens, delivered fast." },
  { img: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&h=1080&fit=crop&q=90", headline: "Fresh. Fast. Flawless.", sub: "Real ingredients. Real chefs. Real-time tracking." },
  { img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&q=90", headline: "Your Table, Anywhere.", sub: "Restaurant-quality dining from the comfort of home." },
  { img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&h=1080&fit=crop&q=90", headline: "Late Night Cravings?", sub: "We have got you covered, 24/7." },
];

const FEATURED = [
  { name: "Grilled Salmon", price: "$24.99", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop", tag: "Seafood" },
  { name: "Wagyu Burger", price: "$17.99", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop", tag: "American" },
  { name: "Tonkotsu Ramen", price: "$15.99", img: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=400&fit=crop", tag: "Japanese" },
  { name: "Margherita Pizza", price: "$14.99", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop", tag: "Italian" },
  { name: "Caesar Salad", price: "$10.99", img: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop", tag: "Healthy" },
  { name: "Pad Thai", price: "$13.99", img: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=400&fit=crop", tag: "Thai" },
  { name: "Chicken Tikka", price: "$16.49", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop", tag: "Indian" },
  { name: "Sushi Platter", price: "$28.99", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop", tag: "Japanese" },
  { name: "Truffle Fries", price: "$8.99", img: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=400&fit=crop", tag: "Sides" },
  { name: "Tiramisu", price: "$9.49", img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop", tag: "Dessert" },
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
  { id: 1, testimonial: "ByteBite has completely changed how I order food. The real-time tracking is incredibly accurate and the restaurant selection is excellent.", author: "Sarah Mitchell -- Customer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop" },
  { id: 2, testimonial: "Since listing on ByteBite, our delivery orders increased by 40%. The kitchen dashboard makes managing orders effortless.", author: "James Rodriguez -- Restaurant Owner", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop" },
  { id: 3, testimonial: "The driver app is intuitive and the route assignments are fair. Best delivery platform I have worked with so far.", author: "Priya Sharma -- Driver", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop" },
];

const CUISINES = ["All", "American", "Japanese", "Italian", "Mexican", "Indian", "Chinese", "Thai"];

/* ── Shared glass style ── */
const glass = "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]";
const glassHover = "hover:bg-white/[0.07] hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(230,57,70,0.08)]";

/* ────────────────────── COMPONENTS ────────────────────── */

function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), 2500);
    return () => clearInterval(timer.current);
  }, [paused]);

  const slide = HERO_SLIDES[idx];

  return (
    <section
      className="relative min-h-[100vh] w-full flex items-center justify-center overflow-hidden -mt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* BG image -- simple opacity crossfade, no scale transform */}
      {HERO_SLIDES.map((s, i) => (
        <img
          key={i}
          src={s.img}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === idx ? 1 : 0 }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/60 to-[#0C0C0C]/30 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C]/80 to-transparent z-[1]" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-16">
        <div className="max-w-3xl space-y-6">
          <div className={`inline-block ${glass} text-[#E63946] text-xs font-bold uppercase tracking-[0.2em] px-5 py-2.5 rounded-full`}>
            #1 Food Delivery Platform
          </div>

          <h1 key={idx} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight text-white animate-[fadeSlideIn_0.5s_ease-out]">
            {slide.headline}
          </h1>

          <p key={`sub-${idx}`} className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed animate-[fadeSlideIn_0.5s_ease-out_0.1s_both]">
            {slide.sub}
          </p>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold h-14 px-8 rounded-full text-base shadow-[0_0_40px_rgba(230,57,70,0.3)] hover:shadow-[0_0_60px_rgba(230,57,70,0.4)] transition-all"
              onClick={() => document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" })}
            >
              Order Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`${glass} text-white hover:bg-white/10 font-medium h-14 px-8 rounded-full text-base`}
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              How It Works
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-8 pt-8">
            {[{ v: "500+", l: "Delivered" }, { v: "50+", l: "Restaurants" }, { v: "4.8", l: "Rating" }].map((s, i) => (
              <div key={s.l}>
                <p className={`text-2xl sm:text-3xl font-black ${i === 2 ? "text-[#E63946]" : "text-white"}`}>{s.v}</p>
                <p className="text-xs text-gray-500 font-medium">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? "w-8 bg-[#E63946]" : "w-4 bg-white/20 hover:bg-white/40"}`} />
        ))}
      </div>
    </section>
  );
}

function RestaurantCard({ restaurant, index }: { restaurant: any; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-80, 80], [3, -3]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-80, 80], [-3, 3]), { stiffness: 300, damping: 30 });
  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
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
        className={`group cursor-pointer ${glass} ${glassHover} rounded-2xl overflow-hidden transition-all duration-300 will-change-transform`}
      >
        <div className="aspect-[16/10] w-full overflow-hidden relative">
          <img src={restaurant.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop"} alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm border border-white/10 text-[#E63946] px-2.5 py-1 rounded-lg text-sm font-bold">
            <Star className="w-3.5 h-3.5 fill-[#E63946]" />{restaurant.rating}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">{restaurant.name}</h3>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{restaurant.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {restaurant.deliveryTime} min</span>
              <span className="w-1 h-1 rounded-full bg-gray-700" />
              <span>{restaurant.cuisineType}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#E63946] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function TestimonialsSection() {
  const [positions, setPositions] = useState(["front", "middle", "back"]);
  const handleShuffle = () => { const n = [...positions]; n.unshift(n.pop()!); setPositions(n); };
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <SectionHeader tag="Testimonials" title="What People Say" />
        <p className="text-center text-gray-600 text-sm -mt-8 mb-14">Drag the front card to shuffle</p>
        <div className="flex justify-center">
          <div className="relative h-[450px] w-[350px]">
            {TESTIMONIALS.map((t, i) => <TestimonialCard key={t.id} {...t} handleShuffle={handleShuffle} position={positions[i]} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ tag, title }: { tag: string; title: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
      <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.2em] mb-3">{tag}</p>
      <h2 className="text-3xl sm:text-4xl font-black text-white">{title}</h2>
    </motion.div>
  );
}

/* ────────────────────── MAIN ────────────────────── */

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
    <div className="bg-[#0C0C0C] text-white w-full -mt-16">
      {/* ── HERO CAROUSEL ── */}
      <HeroCarousel />

      {/* ── FEATURED DISHES (Infinite Marquee) ── */}
      <section className="py-24 border-t border-white/[0.04] overflow-hidden">
        <div className="container mx-auto px-4">
          <SectionHeader tag="Crowd Favorites" title="Popular Right Now" />
        </div>
        {/* Continuous right-to-left scroll */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-[#0C0C0C] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-[#0C0C0C] to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ x: { duration: 30, repeat: Infinity, ease: "linear" } }}
          >
            {/* Duplicate the array for seamless loop */}
            {[...FEATURED, ...FEATURED].map((dish, i) => (
              <div key={`${dish.name}-${i}`}
                className={`shrink-0 w-52 sm:w-60 group ${glass} ${glassHover} rounded-2xl p-5 text-center transition-all duration-300`}>
                <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-full overflow-hidden border-2 border-white/[0.06] group-hover:border-[#E63946]/40 transition-colors shadow-lg mb-4">
                  <img src={dish.img} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
                <span className="text-[10px] font-bold text-[#E63946] uppercase tracking-wider">{dish.tag}</span>
                <h3 className="font-bold text-white mt-1">{dish.name}</h3>
                <p className="text-[#E63946] font-bold text-sm mt-1">{dish.price}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS (directional entry) ── */}
      <section id="how-it-works" className="py-24 border-t border-white/[0.04] overflow-hidden">
        <div className="container mx-auto px-4">
          <SectionHeader tag="Simple Process" title="How It Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto relative">
            {/* Connecting lines (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[calc(33.33%-12px)] right-[calc(33.33%-12px)] h-px">
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}
                className="h-px bg-gradient-to-r from-[#E63946]/40 via-[#E63946]/20 to-[#E63946]/40 origin-left" />
            </div>

            {STEPS.map((step, i) => {
              // Each card enters from a different direction
              const directions = [
                { x: -80, y: 0 },   // left
                { x: 0, y: -60 },   // top
                { x: 80, y: 0 },    // right
              ];
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, ...directions[i] }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
                  whileHover={{ y: -8, transition: { duration: 0.25 } }}
                  className={`${glass} rounded-2xl p-8 text-center transition-all duration-300 group hover:bg-white/[0.07] hover:border-[#E63946]/20 hover:shadow-[0_16px_48px_rgba(230,57,70,0.1)]`}
                >
                  {/* Step number badge */}
                  <div className="relative mx-auto mb-6">
                    <div className="w-20 h-20 bg-[#E63946]/10 border border-[#E63946]/20 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-[#E63946]/20 group-hover:border-[#E63946]/40 group-hover:shadow-[0_0_30px_rgba(230,57,70,0.15)] transition-all duration-300">
                      <step.icon className="w-8 h-8 text-[#E63946]" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#E63946] text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#E63946] transition-colors">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── RESTAURANTS ── */}
      <section id="restaurants" className="py-24 scroll-mt-20 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 space-y-10">
          <SectionHeader tag="Explore" title="Our Restaurants" />

          <div className="max-w-lg mx-auto relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search restaurants, cuisines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-14 pl-12 pr-4 rounded-full ${glass} text-white placeholder:text-gray-600 outline-none focus:border-[#E63946]/40 focus:ring-1 focus:ring-[#E63946]/20 text-sm transition-all`} />
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {CUISINES.map((cat) => {
              const active = activeCategory === cat || (cat === "All" && !activeCategory);
              return (
                <button key={cat} onClick={() => setActiveCategory(cat === "All" ? "" : cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${active ? "bg-[#E63946] text-white shadow-[0_0_20px_rgba(230,57,70,0.3)]" : `${glass} text-gray-400 hover:text-white hover:bg-white/[0.08]`}`}>
                  {cat}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`${glass} rounded-2xl overflow-hidden`}>
                  <Skeleton className="aspect-[16/10] w-full bg-white/[0.04]" />
                  <div className="p-5 space-y-3"><Skeleton className="h-5 w-3/4 bg-white/[0.04] rounded" /><Skeleton className="h-4 w-full bg-white/[0.03] rounded" /></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={`text-center py-16 ${glass} rounded-2xl`}>
              <SearchIcon className="w-10 h-10 text-gray-700 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-500">No restaurants found</p>
              <p className="text-gray-600 text-sm mt-1">Try a different search or category</p>
              {(searchQuery || activeCategory) && <button onClick={() => { setSearchQuery(""); setActiveCategory(""); }} className="text-[#E63946] text-sm font-bold mt-3">Clear filters</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
              {filtered.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US (scale-in with hover glow) ── */}
      <section className="py-24 border-t border-white/[0.04] overflow-hidden">
        <div className="container mx-auto px-4">
          <SectionHeader tag="Why ByteBite" title="Why Choose Us" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {WHY_US.map((item, i) => {
              const dirs = [{ x: -60, rotate: -5 }, { y: 50, scale: 0.9 }, { x: 60, rotate: 5 }];
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, ...dirs[i] }}
                  whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                  whileHover={{ y: -10, transition: { duration: 0.25 } }}
                  className={`${glass} rounded-2xl p-8 text-center transition-all duration-300 group hover:bg-white/[0.07] hover:border-[#E63946]/20 hover:shadow-[0_20px_50px_rgba(230,57,70,0.08)]`}
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                    className="w-16 h-16 bg-[#E63946]/10 border border-[#E63946]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#E63946]/20 group-hover:shadow-[0_0_25px_rgba(230,57,70,0.15)] transition-all"
                  >
                    <item.icon className="w-7 h-7 text-[#E63946]" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#E63946] transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection />

      {/* ── ABOUT (parallax-like split with counter animation) ── */}
      <section id="about" className="py-24 border-t border-white/[0.04] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -60, rotate: -3 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-[#E63946]/5 rounded-[2rem] blur-2xl group-hover:bg-[#E63946]/10 transition-colors duration-500" />
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border border-white/[0.06] shadow-2xl">
                <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=500&fit=crop" alt="About" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C]/60 to-transparent" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-6"
            >
              <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.2em]">About Us</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">We Connect You With The Best Local Restaurants</h2>
              <p className="text-gray-500 leading-relaxed">ByteBite was built with a single mission: make food ordering seamless, fast, and delightful. We partner with the highest-rated local kitchens to bring you restaurant-quality meals delivered to your doorstep in minutes.</p>
              <p className="text-gray-500 leading-relaxed">Our platform serves three communities: customers who love great food, restaurant owners who want to grow their business, and drivers who value fair, flexible work.</p>
              <div className="grid grid-cols-3 gap-6 pt-4">
                {[{ v: "500+", l: "Customers", c: "text-[#E63946]" }, { v: "99%", l: "On-time", c: "text-white" }, { v: "24/7", l: "Support", c: "text-[#2EC4B6]" }].map((s, i) => (
                  <motion.div
                    key={s.l}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`${glass} rounded-xl p-4 text-center`}
                  >
                    <p className={`text-2xl font-black ${s.c}`}>{s.v}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.l}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTACT / CTA (staggered reveal) ── */}
      <section id="contact" className="py-24 border-t border-white/[0.04] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
              <p className="text-sm text-[#E63946] font-bold uppercase tracking-[0.2em]">Get In Touch</p>
              <h2 className="text-3xl font-black text-white">Have Questions? We Are Here To Help.</h2>
              <p className="text-gray-500 leading-relaxed text-sm">Whether you are a customer, restaurant partner, or driver, our team is ready to assist you.</p>
              <div className="space-y-4 pt-2">
                {[
                  { icon: MapPin, text: "San Francisco, CA 94102" },
                  { icon: Mail, text: "support@bytebite.app" },
                  { icon: Phone, text: "+1 (555) 123-4567" },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className={`flex items-center gap-3 text-sm text-gray-400 ${glass} rounded-xl px-4 py-3 hover:bg-white/[0.06] transition-colors`}
                  >
                    <item.icon className="w-4 h-4 text-[#E63946] shrink-0" /> {item.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`flex flex-col justify-center items-center text-center space-y-6 ${glass} rounded-3xl p-10 hover:bg-white/[0.06] hover:border-[#E63946]/15 transition-all duration-300`}
            >
              <div className="w-16 h-16 bg-[#E63946]/10 rounded-2xl flex items-center justify-center">
                <ArrowRight className="w-7 h-7 text-[#E63946]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Ready to get started?</h3>
              <p className="text-gray-500 text-sm max-w-xs">Join thousands of food lovers and order your first meal today.</p>
              <Link href="/register">
                <Button size="lg" className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold h-14 px-10 rounded-full shadow-[0_0_30px_rgba(230,57,70,0.25)] hover:shadow-[0_0_50px_rgba(230,57,70,0.35)] transition-all">
                  Create Account <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t border-white/[0.06]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">ByteBite. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-600">
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
