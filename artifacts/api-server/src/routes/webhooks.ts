import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { emitOrderStatusChanged } from "../socket";

const router: IRouter = Router();

router.post("/webhooks/stripe", async (req, res): Promise<void> => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    res.status(400).json({ error: "Stripe is not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        id: string;
        metadata?: { orderId?: string };
      };

      const rawOrderId = session.metadata?.orderId;
      if (rawOrderId) {
        const orderId = parseInt(rawOrderId, 10);

        const [order] = await db
          .update(ordersTable)
          .set({ paymentStatus: "paid", status: "placed", stripeSessionId: session.id })
          .where(eq(ordersTable.id, orderId))
          .returning();

        if (order) {
          emitOrderStatusChanged(orderId, "placed");
          logger.info({ orderId }, "Payment confirmed — order placed via Stripe webhook");
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    logger.error({ err }, "Stripe webhook signature verification failed");
    res.status(400).json({ error: "Webhook signature verification failed" });
  }
});

export default router;
