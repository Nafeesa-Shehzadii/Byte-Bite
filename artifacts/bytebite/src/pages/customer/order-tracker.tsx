import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Package, ArrowLeft, ClipboardList, CheckCircle, Flame, PackageCheck, Truck } from "lucide-react";

const STATUS_STEPS = ["placed", "accepted", "cooking", "ready", "delivered"] as const;

export default function OrderTracker() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrder(Number(id), {
    query: { enabled: !!id, refetchInterval: 2000, queryKey: getGetOrderQueryKey(Number(id)) }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-12 px-4">
        <Skeleton className="h-8 w-48 bg-[#111111] rounded-lg" />
        <Skeleton className="h-6 w-72 bg-[#111111] rounded-lg" />
        <Skeleton className="h-64 w-full bg-[#111111] rounded-3xl border border-white/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-32 bg-[#111111] rounded-2xl border border-white/10" />
          <Skeleton className="h-32 bg-[#111111] rounded-2xl border border-white/10" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <Package className="w-12 h-12 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold text-zinc-400">Order not found</h2>
        <p className="text-zinc-600 mt-1 mb-6">This order may have been removed.</p>
        <Link href="/" className="text-primary font-bold hover:text-[#FF6B6B] transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as any);

  const stepIcons: Record<string, React.ReactNode> = {
    placed: <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />,
    accepted: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
    cooking: <Flame className="w-4 h-4 sm:w-5 sm:h-5" />,
    ready: <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5" />,
    delivered: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />,
  };

  const getStatusMessage = (step: string) => {
    switch (step) {
      case "placed": return "We've received your order.";
      case "accepted": return "The restaurant has accepted your order.";
      case "cooking": return "The kitchen is preparing your meal.";
      case "ready": return "Order is ready for pickup.";
      case "delivered": return "Enjoy your food!";
      default: return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 sm:py-12 px-4">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors font-medium text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to restaurants
      </Link>

      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-bold uppercase tracking-widest"
        >
          Live Tracking
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Order #{order.id}</h1>
        <p className="text-zinc-400 text-lg">Preparing at <span className="text-zinc-100 font-medium">{order.restaurantName}</span></p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Step Progress */}
        <div className="relative py-6">
          {/* Background track */}
          <div className="absolute top-[calc(50%-14px)] left-6 right-6 sm:left-10 sm:right-10 h-1.5 bg-zinc-800 rounded-full -translate-y-1/2 z-0" />
          {/* Active track */}
          <div
            className="absolute top-[calc(50%-14px)] left-6 sm:left-10 h-1.5 bg-[#2EC4B6] rounded-full -translate-y-1/2 z-0 transition-all duration-700"
            style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * (100 - 10)}%` }}
          />

          <div className="flex justify-between items-center relative z-10">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="flex flex-col items-center" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: isPast || (step === "delivered" && isCurrent) ? "#2EC4B6" : isCurrent ? "#E63946" : "#27272a",
                      scale: isCurrent ? [1, 1.1, 1] : 1,
                      boxShadow: isCurrent ? "0 0 20px rgba(230,57,70,0.6)" : "none"
                    }}
                    transition={isCurrent ? { duration: 1.5, repeat: Infinity } : { duration: 0.4 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white border-4 border-[#111111] shrink-0"
                  >
                    {stepIcons[step]}
                  </motion.div>
                  <span className={`text-xs sm:text-sm font-bold capitalize mt-3 text-center ${isPast || isCurrent ? "text-white" : "text-zinc-600"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center border-t border-white/10 pt-6 mt-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-primary text-lg sm:text-xl font-medium"
            >
              {getStatusMessage(order.status)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Items */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Items</h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-zinc-300">
                  <span className="inline-block w-7 text-center text-primary font-bold bg-primary/10 rounded py-0.5 text-xs mr-2">{item.quantity}x</span>
                  {item.name}
                </span>
                <span className="text-zinc-500 font-mono">${((item.price * item.quantity) / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-white/10 font-bold">
            <span className="text-white">Total</span>
            <span className="text-primary font-mono">${(order.total / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Delivery</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-600 mb-1">Customer</p>
              <p className="text-white font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 mb-1">Address</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-zinc-300 text-sm">{order.deliveryAddress}</p>
              </div>
            </div>
            {order.driverName && (
              <div>
                <p className="text-xs text-zinc-600 mb-1">Driver</p>
                <p className="text-white font-medium">{order.driverName}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {order.status === "delivered" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-4"
        >
          <Link href="/" className="text-primary font-bold hover:text-[#FF6B6B] transition-colors">
            Order something else &rarr;
          </Link>
        </motion.div>
      )}
    </div>
  );
}
