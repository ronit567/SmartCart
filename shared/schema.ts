import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  points: integer("points").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  barcode: text("barcode").notNull().unique(),
  imageUrl: text("image_url"),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: doublePrecision("total").notNull(),
  tax: doublePrecision("tax").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
});

export const pointsTransactions = pgTable("points_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  pointsAmount: integer("points_amount").notNull(),
  transactionType: text("transaction_type").notNull(), // 'earn' or 'redeem'
  description: text("description").notNull(),
  orderId: integer("order_id"),
  rewardId: integer("reward_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  price: true,
  barcode: true,
  imageUrl: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  total: true,
  tax: true,
  subtotal: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  name: true,
  description: true,
  pointsCost: true,
  imageUrl: true,
  active: true,
});

export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions).pick({
  userId: true,
  pointsAmount: true,
  transactionType: true,
  description: true,
  orderId: true,
  rewardId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

export type InsertPointsTransaction = z.infer<typeof insertPointsTransactionSchema>;
export type PointsTransaction = typeof pointsTransactions.$inferSelect;

// Front-end types
export type CartItemWithProduct = {
  id: number;
  quantity: number;
  product: Product;
};

export type OrderWithItems = {
  id: number;
  userId: number;
  total: number;
  tax: number;
  subtotal: number;
  createdAt: Date;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: Product;
  }>;
};
