import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, restaurantsTable, menuItemsTable, ordersTable } from "@workspace/db";
import {
  ListRestaurantsResponse,
  GetRestaurantParams,
  ListMenuItemsQueryParams,
  ListMenuCategoriesQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

// Get restaurants owned by the current user
router.get("/restaurants/mine", requireAuth, requireRole("restaurant"), async (req, res): Promise<void> => {
  const owned = await db.select().from(restaurantsTable).where(eq(restaurantsTable.ownerId, req.user!.id));
  res.json(owned.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    imageUrl: r.imageUrl,
    cuisineType: r.cuisineType,
    deliveryTime: r.deliveryTime,
    rating: r.rating,
  })));
});

router.get("/restaurants", async (_req, res): Promise<void> => {
  const restaurants = await db.select().from(restaurantsTable).orderBy(restaurantsTable.id);
  res.json(ListRestaurantsResponse.parse(restaurants.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    imageUrl: r.imageUrl,
    cuisineType: r.cuisineType,
    deliveryTime: r.deliveryTime,
    rating: r.rating,
  }))));
});

router.get("/restaurants/:id", async (req, res): Promise<void> => {
  const params = GetRestaurantParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, params.data.id));
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  const items = await db.select().from(menuItemsTable).where(eq(menuItemsTable.restaurantId, restaurant.id));

  res.json({
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    imageUrl: restaurant.imageUrl,
    cuisineType: restaurant.cuisineType,
    deliveryTime: restaurant.deliveryTime,
    rating: restaurant.rating,
    menuItems: items.map(item => ({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
    })),
  });
});

router.post("/restaurants", requireAuth, requireRole("restaurant"), async (req, res): Promise<void> => {
  const { menuItems, ...body } = req.body;

  if (!body.name || !body.description || !body.cuisineType || !body.imageUrl) {
    res.status(400).json({ error: "name, description, cuisineType, and imageUrl are required" });
    return;
  }

  const [restaurant] = await db.insert(restaurantsTable).values({
    name: body.name,
    description: body.description,
    imageUrl: body.imageUrl,
    cuisineType: body.cuisineType,
    deliveryTime: body.deliveryTime ?? 30,
    rating: body.rating ?? 4.5,
    ownerId: req.user!.id,
  }).returning();

  if (Array.isArray(menuItems) && menuItems.length > 0) {
    await db.insert(menuItemsTable).values(
      menuItems.map((item: { name: string; description: string; price: number; category: string; imageUrl: string; available?: boolean }) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        available: item.available ?? true,
        restaurantId: restaurant.id,
      })),
    );
  }

  const items = await db.select().from(menuItemsTable).where(eq(menuItemsTable.restaurantId, restaurant.id));

  res.status(201).json({
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    imageUrl: restaurant.imageUrl,
    cuisineType: restaurant.cuisineType,
    deliveryTime: restaurant.deliveryTime,
    rating: restaurant.rating,
    menuItems: items.map(item => ({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
    })),
  });
});

// Update a restaurant (owner only)
router.patch("/restaurants/:id", requireAuth, requireRole("restaurant"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid restaurant id" });
    return;
  }

  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, id));
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  if (restaurant.ownerId !== req.user!.id) {
    res.status(403).json({ error: "You can only update your own restaurants" });
    return;
  }

  const updates: Record<string, any> = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.description) updates.description = req.body.description;
  if (req.body.imageUrl) updates.imageUrl = req.body.imageUrl;
  if (req.body.cuisineType) updates.cuisineType = req.body.cuisineType;
  if (req.body.deliveryTime != null) updates.deliveryTime = req.body.deliveryTime;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const [updated] = await db.update(restaurantsTable).set(updates).where(eq(restaurantsTable.id, id)).returning();

  res.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    imageUrl: updated.imageUrl,
    cuisineType: updated.cuisineType,
    deliveryTime: updated.deliveryTime,
    rating: updated.rating,
  });
});

// Delete a restaurant (owner only)
router.delete("/restaurants/:id", requireAuth, requireRole("restaurant"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid restaurant id" });
    return;
  }

  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, id));
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  if (restaurant.ownerId !== req.user!.id) {
    res.status(403).json({ error: "You can only delete your own restaurants" });
    return;
  }

  // Delete related records in FK order
  await db.delete(ordersTable).where(eq(ordersTable.restaurantId, id));
  await db.delete(menuItemsTable).where(eq(menuItemsTable.restaurantId, id));
  await db.delete(restaurantsTable).where(eq(restaurantsTable.id, id));

  res.json({ success: true });
});

router.get("/menu", async (req, res): Promise<void> => {
  const params = ListMenuItemsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(menuItemsTable).$dynamic();
  if (params.data.restaurantId != null) {
    query = query.where(eq(menuItemsTable.restaurantId, params.data.restaurantId));
  }

  const items = await query.orderBy(menuItemsTable.category, menuItemsTable.name);
  res.json(items.map(item => ({
    id: item.id,
    restaurantId: item.restaurantId,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.imageUrl,
    available: item.available,
  })));
});

// Create a menu item (owner only)
router.post("/menu/items", requireAuth, requireRole("restaurant"), async (req, res): Promise<void> => {
  const { restaurantId, name, description, price, category, imageUrl, available } = req.body;

  if (!restaurantId || !name || !description || price == null || !category || !imageUrl) {
    res.status(400).json({ error: "restaurantId, name, description, price, category, and imageUrl are required" });
    return;
  }

  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, restaurantId));
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }
  if (restaurant.ownerId !== req.user!.id) {
    res.status(403).json({ error: "You can only add items to your own restaurants" });
    return;
  }

  const [item] = await db.insert(menuItemsTable).values({
    restaurantId,
    name,
    description,
    price,
    category,
    imageUrl,
    available: available ?? true,
  }).returning();

  res.status(201).json({
    id: item.id,
    restaurantId: item.restaurantId,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.imageUrl,
    available: item.available,
  });
});

// Update a menu item (owner only)
router.patch("/menu/items/:id", requireAuth, requireRole("restaurant"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid menu item id" });
    return;
  }

  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, id));
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, item.restaurantId));
  if (!restaurant || restaurant.ownerId !== req.user!.id) {
    res.status(403).json({ error: "You can only update items in your own restaurants" });
    return;
  }

  const updates: Record<string, any> = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.description) updates.description = req.body.description;
  if (req.body.price != null) updates.price = req.body.price;
  if (req.body.category) updates.category = req.body.category;
  if (req.body.imageUrl) updates.imageUrl = req.body.imageUrl;
  if (req.body.available != null) updates.available = req.body.available;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const [updated] = await db.update(menuItemsTable).set(updates).where(eq(menuItemsTable.id, id)).returning();

  res.json({
    id: updated.id,
    restaurantId: updated.restaurantId,
    name: updated.name,
    description: updated.description,
    price: updated.price,
    category: updated.category,
    imageUrl: updated.imageUrl,
    available: updated.available,
  });
});

// Delete a menu item (owner only)
router.delete("/menu/items/:id", requireAuth, requireRole("restaurant"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid menu item id" });
    return;
  }

  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, id));
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, item.restaurantId));
  if (!restaurant || restaurant.ownerId !== req.user!.id) {
    res.status(403).json({ error: "You can only delete items in your own restaurants" });
    return;
  }

  await db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
  res.json({ success: true });
});

router.get("/menu/categories", async (req, res): Promise<void> => {
  const params = ListMenuCategoriesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.selectDistinct({ category: menuItemsTable.category }).from(menuItemsTable).$dynamic();
  if (params.data.restaurantId != null) {
    query = query.where(eq(menuItemsTable.restaurantId, params.data.restaurantId));
  }

  const rows = await query.orderBy(menuItemsTable.category);
  res.json(rows.map(r => r.category));
});

export default router;
