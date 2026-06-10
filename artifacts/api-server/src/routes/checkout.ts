import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { CreateCheckoutSessionBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { requireAuth } from "../middlewares/auth";
import { emitOrderStatusChanged } from "../socket";

const router: IRouter = Router();

router.post("/checkout/session", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (stripeKey) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKey);

      // Prices come from the DB as dollars (e.g. 12.99). Stripe expects cents.
      const lineItems = parsed.data.items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      }));

      const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
      const baseUrl = domains ? `https://${domains}` : (process.env.FRONTEND_URL || "http://localhost:5173");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${baseUrl}/track/${parsed.data.orderId}?payment=success`,
        cancel_url: `${baseUrl}/?payment=cancelled`,
        metadata: { orderId: String(parsed.data.orderId) },
      });

      // Mark order as awaiting payment
      await db.update(ordersTable)
        .set({ stripeSessionId: session.id, status: "pending_payment" })
        .where(eq(ordersTable.id, parsed.data.orderId));

      res.json({ sessionId: session.id, url: session.url ?? "" });
      return;
    } catch (err) {
      logger.error({ err }, "Stripe checkout session creation failed");
      res.status(500).json({ error: "Payment processing failed" });
      return;
    }
  }

  // Fallback: simulate payment — immediately mark as placed
  logger.warn("STRIPE_SECRET_KEY not set — using simulated checkout");
  const fakeSessionId = `sim_${Date.now()}`;

  await db.update(ordersTable)
    .set({ stripeSessionId: fakeSessionId, paymentStatus: "paid", status: "placed" })
    .where(eq(ordersTable.id, parsed.data.orderId));

  emitOrderStatusChanged(parsed.data.orderId, "placed");

  res.json({
    sessionId: fakeSessionId,
    url: `/?order_id=${parsed.data.orderId}&payment=success`,
  });
});

// Confirm payment after Stripe redirect (works without webhook)
router.post("/checkout/confirm", requireAuth, async (req, res): Promise<void> => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ error: "orderId required" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order || !order.stripeSessionId) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Already confirmed
  if (order.paymentStatus === "paid") {
    res.json({ status: "already_paid" });
    return;
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || order.stripeSessionId.startsWith("sim_")) {
    res.json({ status: "simulated" });
    return;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

    if (session.payment_status === "paid") {
      await db.update(ordersTable)
        .set({ paymentStatus: "paid", status: "placed" })
        .where(eq(ordersTable.id, orderId));

      emitOrderStatusChanged(orderId, "placed");
      logger.info({ orderId }, "Payment confirmed via session check");
      res.json({ status: "paid" });
    } else {
      res.json({ status: session.payment_status });
    }
  } catch (err) {
    logger.error({ err }, "Failed to verify Stripe session");
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
