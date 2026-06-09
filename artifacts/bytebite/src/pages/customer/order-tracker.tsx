import { useGetOrder } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, ChefHat, MapPin, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STEPS = ["placed", "accepted", "cooking", "ready", "delivered"] as const;

export default function OrderTracker() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrder(Number(id), { 
    query: { enabled: !!id, refetchInterval: 2000 }
  });

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full max-w-2xl mx-auto rounded-3xl bg-white/5 border border-white/10 mt-12" />;
  }

  if (!order) return <div className="text-center py-20 text-zinc-500">Order not found</div>;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as any);

  const icons = {
    placed: Clock,
    accepted: CheckCircle2,
    cooking: ChefHat,
    ready: Package,
    delivered: MapPin,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-12">
      <div className="text-center space-y-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-sm font-bold uppercase tracking-widest mb-2"
        >
          Live Tracking
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight">Order #{order.id}</h1>
        <p className="text-zinc-400 text-lg">Preparing at <span className="text-zinc-100 font-medium">{order.restaurantName}</span></p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative">
          {/* Vertical progress line */}
          <div className="absolute left-[27px] sm:left-[31px] top-6 bottom-6 w-[2px] bg-zinc-800" />
          
          <div className="space-y-12 relative">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = icons[step];
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;

              return (
                <div key={step} className="flex items-start gap-6 sm:gap-8">
                  <motion.div 
                    initial={false}
                    animate={{
                      backgroundColor: isPast || isCurrent ? "#f59e0b" : "#27272a",
                      color: isPast || isCurrent ? "#09090b" : "#71717a",
                      scale: isCurrent ? 1.15 : 1,
                      boxShadow: isCurrent ? "0 0 20px rgba(245,158,11,0.4)" : "none"
                    }}
                    transition={{ duration: 0.4 }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative z-10 border-4 ${isCurrent ? 'border-amber-500/20' : 'border-zinc-950'} shrink-0`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </motion.div>
                  <div className="flex-1 pt-3 sm:pt-4">
                    <h3 className={`text-xl sm:text-2xl font-bold capitalize tracking-tight ${isFuture ? 'text-zinc-600' : 'text-zinc-100'}`}>
                      {step}
                    </h3>
                    <AnimatePresence>
                      {isCurrent && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-amber-500 font-medium text-sm sm:text-base">
                            {step === 'placed' && "We've received your order."}
                            {step === 'accepted' && `Driver ${order.driverName ? order.driverName : 'assigned'} is on standby.`}
                            {step === 'cooking' && "The kitchen is preparing your meal."}
                            {step === 'ready' && "Order is ready for pickup."}
                            {step === 'delivered' && "Enjoy your food!"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {order.status === 'delivered' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8"
        >
          <a href="/" className="text-amber-500 font-bold hover:text-amber-400 transition-colors">
            Order something else &rarr;
          </a>
        </motion.div>
      )}
    </div>
  );
}