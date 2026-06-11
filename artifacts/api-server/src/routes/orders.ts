import { Router, type IRouter } from "express";
import { eq, sql, inArray } from "drizzle-orm";
import { db, ordersTable, restaurantsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import { emitOrderCreated, emitOrderStatusChanged } from "../socket";
import { logger } from "../lib/logger";
import { supabase } from "../lib/supabase";
import { requireAuth, requireRole } from "../middlewares/auth";

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

// Helper: get restaurant IDs owned by the current user
async function getOwnerRestaurantIds(userId: string): Promise<number[]> {
  const rows = await db.select({ id: restaurantsTable.id }).from(restaurantsTable).where(eq(restaurantsTable.ownerId, userId));
  return rows.map((r) => r.id);
}

router.get("/orders/summary", requireAuth, requireRole("restaurant"), async (req, res): Promise<void> => {
  const restaurantIds = await getOwnerRestaurantIds(req.user!.id);
  if (restaurantIds.length === 0) {
    res.json({ total: 0, placed: 0, accepted: 0, cooking: 0, ready: 0, delivered: 0, revenue: 0 });
    return;
  }

  const orders = await db.select().from(ordersTable).where(inArray(ordersTable.restaurantId, restaurantIds));
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

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(ordersTable).$dynamic();

  // Restaurant owners only see orders for their restaurants
  if (req.user!.role === "restaurant") {
    const restaurantIds = await getOwnerRestaurantIds(req.user!.id);
    if (restaurantIds.length === 0) { res.json([]); return; }
    query = query.where(inArray(ordersTable.restaurantId, restaurantIds));
  }

  if (params.data.status) {
    query = query.where(eq(ordersTable.status, params.data.status));
  }

  const orders = await query.orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map(serializeOrder));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid order body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db.insert(ordersTable).values({
    customerName: req.user!.name,
    customerId: req.user!.id,
    restaurantId: parsed.data.restaurantId,
    restaurantName: parsed.data.restaurantName,
    total: parsed.data.total,
    deliveryAddress: parsed.data.deliveryAddress,
    items: parsed.data.items,
    status: "placed",
    paymentStatus: "pending",
  }).returning();

  if (supabase) {
    supabase.from("orders").insert({
      customer_name: order.customerName,
      restaurant_id: order.restaurantId,
      restaurant_name: order.restaurantName,
      total: order.total,
      delivery_address: order.deliveryAddress,
      items: order.items,
      status: order.status,
      payment_status: order.paymentStatus,
    }).then(({ error }) => {
      if (error) logger.debug({ err: error.message }, "Supabase order sync failed (tables may not be set up)");
    });
  }

  emitOrderCreated({
    id: order.id,
    customerName: order.customerName,
    restaurantId: order.restaurantId,
    status: order.status,
    total: order.total,
  });

  res.status(201).json(serializeOrder(order));
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
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

router.patch("/orders/:id/status", requireAuth, requireRole("restaurant", "driver"), async (req, res): Promise<void> => {
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

  // Verify authorization: restaurant owners can update their orders, drivers can update their assigned orders
  const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (req.user!.role === "restaurant") {
    const restaurantIds = await getOwnerRestaurantIds(req.user!.id);
    if (!restaurantIds.includes(existing.restaurantId)) {
      res.status(403).json({ error: "Not authorized to update this order" });
      return;
    }
  } else if (req.user!.role === "driver") {
    if (existing.driverId !== req.user!.id) {
      res.status(403).json({ error: "Not authorized to update this order" });
      return;
    }
  }

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
