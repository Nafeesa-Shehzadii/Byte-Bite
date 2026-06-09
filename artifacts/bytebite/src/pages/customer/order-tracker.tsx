import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STEPS = ["placed", "accepted", "cooking", "ready", "delivered"] as const;

export default function OrderTracker() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrder(Number(id), { 
    query: { enabled: !!id, refetchInterval: 2000, queryKey: getGetOrderQueryKey(Number(id)) }
  });

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full max-w-4xl mx-auto rounded-3xl bg-[#111111] border border-white/10 mt-12" />;
  }

  if (!order) return <div className="text-center py-20 text-zinc-500">Order not found</div>;

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as any);

  const emojis = {
    placed: "📋",
    accepted: "✅",
    cooking: "👨‍🍳",
    ready: "📦",
    delivered: "🛵",
  };

  const getStatusMessage = (step: string) => {
    switch(step) {
      case 'placed': return "We've received your order.";
      case 'accepted': return `Driver ${order.driverName ? order.driverName : 'assigned'} is on standby.`;
      case 'cooking': return "The kitchen is preparing your meal.";
      case 'ready': return "Order is ready for pickup.";
      case 'delivered': return "Enjoy your food!";
      default: return "";
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-12 px-4">
      <div className="text-center space-y-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-bold uppercase tracking-widest mb-2"
        >
          Live Tracking
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Order #{order.id}</h1>
        <p className="text-zinc-400 text-lg">Preparing at <span className="text-zinc-100 font-medium">{order.restaurantName}</span></p>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Horizontal Progress */}
        <div className="relative pt-8 pb-16">
          <div className="flex justify-between items-center relative z-10">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
              // Connecting line segment
              const lineActive = idx <= currentStepIndex;
              
              return (
                <div key={step} className="flex flex-col items-center relative" style={{ width: '20%' }}>
                  {/* Connecting Line */}
                  {idx > 0 && (
                    <div 
                      className="absolute top-6 -left-[50%] w-full h-1.5 -translate-y-1/2 -z-10"
                      style={{ backgroundColor: lineActive ? '#2EC4B6' : '#27272a' }}
                    />
                  )}
                  
                  {/* Circle Marker */}
                  <motion.div 
                    initial={false}
                    animate={{
                      backgroundColor: isPast || (step === 'delivered' && isCurrent) ? "#2EC4B6" : isCurrent ? "#E63946" : "#27272a",
                      scale: isCurrent ? [1, 1.1, 1] : 1,
                      boxShadow: isCurrent ? "0 0 20px rgba(230,57,70,0.6)" : "none"
                    }}
                    transition={isCurrent ? { duration: 1.5, repeat: Infinity } : { duration: 0.4 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 border-4 border-[#111111] shrink-0`}
                  >
                    {emojis[step as keyof typeof emojis]}
                  </motion.div>
                  
                  {/* Label */}
                  <div className={`absolute top-16 w-32 text-center text-sm font-bold capitalize mt-2 ${isPast || isCurrent ? 'text-white' : 'text-zinc-600'}`}>
                    {step}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center border-t border-white/10 pt-8 mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-primary text-xl font-medium"
            >
              {getStatusMessage(order.status)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {order.status === 'delivered' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8"
        >
          <a href="/" className="text-primary font-bold hover:text-[#FF6B6B] transition-colors">
            Order something else &rarr;
          </a>
        </motion.div>
      )}
    </div>
  );
}
