import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, restaurantsTable, menuItemsTable } from "@workspace/db";
import {
  ListRestaurantsResponse,
  GetRestaurantParams,
  ListMenuItemsQueryParams,
  ListMenuCategoriesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

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
