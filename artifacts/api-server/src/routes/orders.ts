import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import { emitOrderCreated, emitOrderStatusChanged } from "../socket";
import { logger } from "../lib/logger";

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

router.get("/orders/summary", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);
  const summary = {
    total: orders.length,
    placed: orders.filter(o => o.status === "placed").length,
    accepted: orders.filter(o => o.status === "accepted").length,
    cooking: orders.filter(o => o.status === "cooking").length,
    ready: orders.filter(o => o.status === "ready").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    revenue: orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + o.total, 0),
  };
  res.json(summary);
});

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(ordersTable).$dynamic();
  if (params.data.status) {
    query = query.where(eq(ordersTable.status, params.data.status));
  }

  const orders = await query.orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map(serializeOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid order body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db.insert(ordersTable).values({
    customerName: parsed.data.customerName,
    restaurantId: parsed.data.restaurantId,
    restaurantName: parsed.data.restaurantName,
    total: parsed.data.total,
    deliveryAddress: parsed.data.deliveryAddress,
    items: parsed.data.items,
    status: "placed",
    paymentStatus: "pending",
  }).returning();

  emitOrderCreated({
    id: order.id,
    customerName: order.customerName,
    restaurantId: order.restaurantId,
    status: order.status,
    total: order.total,
  });

  res.status(201).json(serializeOrder(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(serializeOrder(order));
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const paramsResult = UpdateOrderStatusParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.message });
    return;
  }

  const bodyResult = UpdateOrderStatusBody.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.message });
    return;
  }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [order] = await db.update(ordersTable)
    .set({ status: bodyResult.data.status })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  emitOrderStatusChanged(order.id, order.status);
  logger.info({ orderId: order.id, status: order.status }, "Order status updated");

  res.json(serializeOrder(order));
});

export default router;
