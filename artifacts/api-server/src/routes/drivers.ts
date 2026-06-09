import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  AcceptOrderParams,
  AcceptOrderBody,
  ListDriverOrdersQueryParams,
} from "@workspace/api-zod";
import { emitOrderAccepted, emitOrderStatusChanged } from "../socket";

const router: IRouter = Router();

function serializeOrder(order: typeof ordersTable.$inferSelect) {
  return {
    id: order.id,
    customerName: order.customerName,
    restaurantId: order.restaurantId,
    restaurantName: order.restaurantName,
    driverName: order.driverName ?? null,
    status: order.status,
    total: order.total,
    deliveryAddress: order.deliveryAddress,
    items: order.items as Array<{ menuItemId: number; name: string; price: number; quantity: number }>,
    stripeSessionId: order.stripeSessionId ?? null,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/drivers/available", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.status, "ready"))
    .orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map(serializeOrder));
});

router.get("/drivers/my-orders", async (req, res): Promise<void> => {
  const params = ListDriverOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(ordersTable)
    .where(eq(ordersTable.driverName, params.data.driverName ?? ""))
    .$dynamic();

  const orders = await query.orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map(serializeOrder));
});

router.patch("/drivers/:orderId/accept", async (req, res): Promise<void> => {
  const paramsResult = AcceptOrderParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.message });
    return;
  }

  const bodyResult = AcceptOrderBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.message });
    return;
  }

  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);

  const [order] = await db.update(ordersTable)
    .set({ driverName: bodyResult.data.driverName, status: "delivered" })
    .where(eq(ordersTable.id, orderId))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  emitOrderAccepted(order.id, bodyResult.data.driverName);
  emitOrderStatusChanged(order.id, order.status);

  res.json(serializeOrder(order));
});

export default router;
