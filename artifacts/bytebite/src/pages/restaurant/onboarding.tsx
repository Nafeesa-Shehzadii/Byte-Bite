import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/shared/page-transition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Plus, Trash2, ArrowLeft, ArrowRight, Store, Star, Clock, Eye, Rocket } from "lucide-react";
import { toast } from "sonner";

const CUISINES = ["American", "Japanese", "Italian", "Mexican", "Indian", "Chinese", "Thai", "Mediterranean", "Korean", "French"];
const STEPS = ["Info", "Menu", "Preview", "Launch"];

interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  backgroundColor: done ? "#2EC4B6" : active ? "#E63946" : "#27272a",
                  boxShadow: active ? "0 0 20px rgba(230,57,70,0.5)" : "none",
                  scale: active ? 1.1 : 1,
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </motion.div>
              <span className={`text-[10px] sm:text-xs font-medium ${active ? "text-white" : "text-zinc-600"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 rounded-full mb-5 ${i < current ? "bg-[#2EC4B6]" : "bg-zinc-800"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RestaurantOnboarding() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Step 1 state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("30");
  const [rating, setRating] = useState("4.5");

  // Step 2 state
  const [items, setItems] = useState<MenuItem[]>([
    { name: "", description: "", price: "", category: "", imageUrl: "" },
  ]);

  const addItem = () => setItems([...items, { name: "", description: "", price: "", category: "", imageUrl: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof MenuItem, value: string) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    setItems(copy);
  };

  const canAdvance = () => {
    if (step === 0) return name && description && cuisineType && imageUrl;
    if (step === 1) return items.some((it) => it.name && it.price && it.category);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const validItems = items.filter((it) => it.name && it.price && it.category);
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          cuisineType,
          imageUrl,
          deliveryTime: Number(deliveryTime),
          rating: Number(rating),
          menuItems: validItems.map((it) => ({
            name: it.name,
            description: it.description || "Delicious!",
            price: parseFloat(it.price),
            category: it.category,
            imageUrl: it.imageUrl || imageUrl,
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to create restaurant");
      toast.success("Restaurant created!", { description: `${name} is now live` });
      setLocation("/restaurant");
    } catch {
      toast.error("Failed to create restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 max-w-2xl py-8 sm:py-12">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait" custom={1}>
          {step === 0 && (
            <motion.div key="s0" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="space-y-5">
              <div className="text-center mb-6">
                <Store className="w-10 h-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-extrabold text-white">Restaurant Details</h2>
                <p className="text-zinc-500 text-sm mt-1">Tell us about your restaurant</p>
              </div>
              <Input placeholder="Restaurant Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-[#111111] border-white/10 text-white h-12 rounded-xl" />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#111111] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder:text-zinc-500 outline-none focus:border-primary/50 resize-none"
              />
              <Select value={cuisineType} onValueChange={setCuisineType}>
                <SelectTrigger className="bg-[#111111] border-white/10 text-zinc-100 h-12 rounded-xl">
                  <SelectValue placeholder="Cuisine Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-white/10 text-zinc-100">
                  {CUISINES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Image URL (cover photo)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="bg-[#111111] border-white/10 text-white h-12 rounded-xl" />
              {imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-[#0A0A0A]">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Delivery (min)</label>
                  <Input type="number" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} min={10} max={90} className="bg-[#111111] border-white/10 text-white h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500 font-medium flex items-center gap-1"><Star className="w-3 h-3" /> Rating</label>
                  <Input type="number" value={rating} onChange={(e) => setRating(e.target.value)} min={1} max={5} step={0.1} className="bg-[#111111] border-white/10 text-white h-10 rounded-xl" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold text-white">Menu Items</h2>
                <p className="text-zinc-500 text-sm mt-1">Add at least one item</p>
              </div>
              {items.map((item, i) => (
                <div key={i} className="bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-3 relative">
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Item Name" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white h-10 rounded-lg text-sm" />
                    <Input placeholder="Price (e.g. 12.99)" type="number" step="0.01" value={item.price} onChange={(e) => updateItem(i, "price", e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white h-10 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Category (e.g. Mains)" value={item.category} onChange={(e) => updateItem(i, "category", e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white h-10 rounded-lg text-sm" />
                    <Input placeholder="Image URL (optional)" value={item.imageUrl} onChange={(e) => updateItem(i, "imageUrl", e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white h-10 rounded-lg text-sm" />
                  </div>
                  <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white h-10 rounded-lg text-sm" />
                </div>
              ))}
              <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-white/10 rounded-2xl text-zinc-500 hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                <Plus className="w-4 h-4" /> Add Another Item
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="space-y-6">
              <div className="text-center mb-6">
                <Eye className="w-10 h-10 text-[#2EC4B6] mx-auto mb-3" />
                <h2 className="text-2xl font-extrabold text-white">Preview</h2>
                <p className="text-zinc-500 text-sm mt-1">Here's how it'll look</p>
              </div>
              <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
                {imageUrl && <img src={imageUrl} alt={name} className="w-full aspect-video object-cover opacity-80" />}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{name}</h3>
                    <span className="flex items-center gap-1 text-primary text-sm font-bold"><Star className="w-4 h-4 fill-primary" /> {rating}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{description}</p>
                  <div className="flex gap-3 text-xs text-zinc-500">
                    <span>{cuisineType}</span>
                    <span>{deliveryTime} min delivery</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Menu ({items.filter((it) => it.name).length} items)</h4>
                {items.filter((it) => it.name).map((it, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{it.name}</p>
                      <p className="text-xs text-zinc-500">{it.category}</p>
                    </div>
                    <span className="text-sm font-mono text-primary">${Number(it.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="text-center space-y-6 py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <Rocket className="w-16 h-16 text-primary mx-auto" />
              </motion.div>
              <h2 className="text-3xl font-extrabold text-white">Ready to Launch!</h2>
              <p className="text-zinc-400 max-w-sm mx-auto">
                Your restaurant <span className="text-white font-bold">{name}</span> with {items.filter((it) => it.name).length} menu items is ready to go live.
              </p>
              <Button
                size="lg"
                disabled={submitting}
                onClick={handleSubmit}
                className="bg-primary text-white hover:bg-[#FF6B6B] font-bold text-lg px-10 h-14 rounded-xl shadow-[0_0_30px_rgba(230,57,70,0.3)]"
              >
                {submitting ? "Creating..." : "Launch Restaurant"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="border-white/10 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < 3 && (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="bg-primary text-white hover:bg-[#FF6B6B] font-bold"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
