import { Router, type IRouter } from "express";
import { eq, sql, and, isNull } from "drizzle-orm";
import { db, ordersTable, driversTable } from "@workspace/db";
import { AcceptOrderParams } from "@workspace/api-zod";
import { emitOrderAccepted, emitOrderStatusChanged } from "../socket";
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

// List all driver profiles
router.get("/drivers/profiles", requireAuth, requireRole("driver"), async (_req, res): Promise<void> => {
  const drivers = await db.select().from(driversTable).orderBy(driversTable.name);
  res.json(drivers.map(d => ({
    id: d.id,
    name: d.name,
    phone: d.phone,
    vehicle: d.vehicle,
    avatarUrl: d.avatarUrl,
    available: d.available,
  })));
});

// Create a driver profile
router.post("/drivers/profiles", requireAuth, requireRole("driver"), async (req, res): Promise<void> => {
  const { name, phone, vehicle, avatarUrl, available } = req.body;

  if (!name || !phone || !vehicle || !avatarUrl) {
    res.status(400).json({ error: "name, phone, vehicle, and avatarUrl are required" });
    return;
  }

  const [driver] = await db.insert(driversTable).values({
    name,
    phone,
    vehicle,
    avatarUrl,
    available: available ?? true,
  }).returning();

  res.status(201).json({
    id: driver.id,
    name: driver.name,
    phone: driver.phone,
    vehicle: driver.vehicle,
    avatarUrl: driver.avatarUrl,
    available: driver.available,
  });
});

// Orders ready for pickup
router.get("/drivers/available", requireAuth, requireRole("driver"), async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.status, "ready"))
    .orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map(serializeOrder));
});

// Driver's assigned orders — uses session identity
router.get("/drivers/my-orders", requireAuth, requireRole("driver"), async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.driverId, userId))
    .orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map(serializeOrder));
});

// Accept order — uses session identity
router.patch("/drivers/:orderId/accept", requireAuth, requireRole("driver"), async (req, res): Promise<void> => {
  const paramsResult = AcceptOrderParams.safeParse(req.params);
  if (!paramsResult.success) {
    res.status(400).json({ error: paramsResult.error.message });
    return;
  }

  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);
  const user = req.user!;

  // Optimistic lock: only succeeds if driver_id IS NULL (no other driver claimed it)
  const [order] = await db.update(ordersTable)
    .set({ driverName: user.name, driverId: user.id, status: "assigned" })
    .where(and(eq(ordersTable.id, orderId), isNull(ordersTable.driverId)))
    .returning();

  if (!order) {
    // Distinguish "not found" from "already taken"
    const [existing] = await db.select({ id: ordersTable.id }).from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!existing) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(409).json({ error: "Order already accepted by another driver" });
    }
    return;
  }

  emitOrderAccepted(order.id, user.name);
  emitOrderStatusChanged(order.id, order.status);

  res.json(serializeOrder(order));
});

export default router;
