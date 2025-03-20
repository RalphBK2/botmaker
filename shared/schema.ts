import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: text("role").default("user"),
  createdAt: text("created_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
});

// Subscription Plans
export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  maxChatbots: integer("max_chatbots").notNull(),
  features: jsonb("features").notNull(),
});

export const insertPlanSchema = createInsertSchema(plans);

// User Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planId: text("plan_id").notNull(),
  status: text("status").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  renewalDate: text("renewal_date").notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  planId: true,
  status: true,
  startDate: true,
  endDate: true,
  renewalDate: true,
});

// Chatbots
export const chatbots = pgTable("chatbots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("draft"),
  color: text("color").default("primary"),
  appearance: jsonb("appearance"),
  settings: jsonb("settings"),
  aiSettings: jsonb("ai_settings"),
  flows: jsonb("flows").default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertChatbotSchema = createInsertSchema(chatbots).pick({
  userId: true,
  name: true,
  description: true,
  status: true,
  color: true,
  appearance: true,
  settings: true,
  aiSettings: true,
  flows: true,
  createdAt: true,
  updatedAt: true,
});

// Conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  chatbotId: integer("chatbot_id").notNull(),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  resolved: boolean("resolved").default(false),
  messages: jsonb("messages").default([]),
  metadata: jsonb("metadata"),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  chatbotId: true,
  startedAt: true,
  endedAt: true,
  resolved: true,
  messages: true,
  metadata: true,
});

// Templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  category: text("category").notNull(),
  complexity: text("complexity").notNull(),
  content: jsonb("content").notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  description: true,
  icon: true,
  color: true,
  category: true,
  complexity: true,
  content: true,
});

// User Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  api: jsonb("api"),
  notifications: jsonb("notifications"),
  appearance: jsonb("appearance"),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  api: true,
  notifications: true,
  appearance: true,
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type Chatbot = typeof chatbots.$inferSelect;
export type InsertChatbot = z.infer<typeof insertChatbotSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
