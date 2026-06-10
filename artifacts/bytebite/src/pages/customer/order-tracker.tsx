import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Package, ArrowLeft, ClipboardList, CheckCircle, Flame, PackageCheck, Truck } from "lucide-react";
import { useEffect, useRef } from "react";

const STATUS_STEPS = ["placed", "accepted", "cooking", "ready", "delivered"] as const;

export default function OrderTracker() {
  const { id } = useParams();
  const { data: order, isLoading } = useGetOrder(Number(id), { query: { enabled: !!id, refetchInterval: 2000, queryKey: getGetOrderQueryKey(Number(id)) } });
  const confirmedRef = useRef(false);

  // Auto-confirm payment when redirected from Stripe
  useEffect(() => {
    if (confirmedRef.current || !id) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      confirmedRef.current = true;
      fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: Number(id) }),
      }).catch(() => {});
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-[#0C0C0C] min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6 py-12 px-4">
          <Skeleton className="h-8 w-48 bg-white/[0.06] rounded-lg" />
          <Skeleton className="h-64 w-full bg-white/[0.06] rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-32 bg-white/[0.06] rounded-2xl" />
            <Skeleton className="h-32 bg-white/[0.06] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#0C0C0C] min-h-screen flex flex-col items-center justify-center py-32 px-4 text-center">
        <Package className="w-12 h-12 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-500">Order not found</h2>
        <Link href="/" className="text-[#E63946] font-bold text-sm mt-4">Back to Home</Link>
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
  const msgs: Record<string, string> = {
    placed: "We have received your order.", accepted: "The restaurant has accepted your order.",
    cooking: "The kitchen is preparing your meal.", ready: "Order is ready for pickup.", delivered: "Your food has been delivered.",
  };

  return (
    <div className="bg-[#0C0C0C] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8 py-8 sm:py-12 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#E63946] transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to restaurants
        </Link>

        <div className="text-center space-y-3">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-[#E63946]/10 text-[#E63946] rounded-full text-sm font-bold uppercase tracking-widest">
            Live Tracking
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Order #{order.id}</h1>
          <p className="text-gray-500 text-lg">Preparing at <span className="text-white font-medium">{order.restaurantName}</span></p>
        </div>

        {/* Progress */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-none relative overflow-hidden">
          <div className="relative py-6">
            <div className="absolute top-[calc(50%-14px)] left-6 right-6 sm:left-10 sm:right-10 h-1.5 bg-white/[0.06] rounded-full -translate-y-1/2 z-0" />
            <div className="absolute top-[calc(50%-14px)] left-6 sm:left-10 h-1.5 bg-[#E63946] rounded-full -translate-y-1/2 z-0 transition-all duration-700"
              style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 90}%` }} />
            <div className="flex justify-between items-center relative z-10">
              {STATUS_STEPS.map((step, idx) => {
                const isPast = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                    <motion.div initial={false} animate={{
                      backgroundColor: isPast || (step === "delivered" && isCurrent) ? "#10B981" : isCurrent ? "#E63946" : "#E5E7EB",
                      scale: isCurrent ? [1, 1.1, 1] : 1,
                      boxShadow: isCurrent ? "0 0 16px rgba(230,57,70,0.4)" : "none",
                    }} transition={isCurrent ? { duration: 1.5, repeat: Infinity } : { duration: 0.4 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white border-4 border-[#0C0C0C] shrink-0">
                      {stepIcons[step]}
                    </motion.div>
                    <span className={`text-xs sm:text-sm font-bold capitalize mt-3 text-center ${isPast || isCurrent ? "text-white" : "text-gray-500"}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-center border-t border-white/[0.08] pt-6 mt-4">
            <AnimatePresence mode="wait">
              <motion.p key={currentStepIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="text-[#E63946] text-lg sm:text-xl font-medium">{msgs[order.status] || ""}</motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-none">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600"><span className="inline-block w-7 text-center text-[#E63946] font-bold bg-[#E63946]/10 rounded py-0.5 text-xs mr-2">{item.quantity}x</span>{item.name}</span>
                  <span className="text-gray-500 font-mono">${((item.price * item.quantity)).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/[0.08] font-bold">
              <span className="text-white">Total</span>
              <span className="text-[#E63946] font-mono">${(order.total).toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 space-y-4 shadow-none">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Delivery</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-gray-500 mb-1">Customer</p><p className="text-white font-medium">{order.customerName}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">Address</p>
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" /><p className="text-gray-600 text-sm">{order.deliveryAddress}</p></div>
              </div>
              {order.driverName && <div><p className="text-xs text-gray-500 mb-1">Driver</p><p className="text-white font-medium">{order.driverName}</p></div>}
            </div>
          </div>
        </div>

        {order.status === "delivered" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-4">
            <Link href="/" className="text-[#E63946] font-bold hover:underline">Order something else</Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
