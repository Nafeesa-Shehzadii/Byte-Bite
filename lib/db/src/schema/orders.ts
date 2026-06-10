import { pgTable, serial, text, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { restaurantsTable } from "./restaurants";
import { userTable } from "./auth";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerId: text("customer_id").references(() => userTable.id),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurantsTable.id),
  restaurantName: text("restaurant_name").notNull(),
  driverName: text("driver_name"),
  driverId: text("driver_id").references(() => userTable.id),
  status: text("status").notNull().default("placed"),
  total: real("total").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  items: jsonb("items").notNull().$type<Array<{ menuItemId: number; name: string; price: number; quantity: number }>>(),
  stripeSessionId: text("stripe_session_id"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
