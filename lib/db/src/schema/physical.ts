import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const physicalTable = pgTable("physical_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPhysicalSchema = createInsertSchema(physicalTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPhysical = z.infer<typeof insertPhysicalSchema>;
export type Physical = typeof physicalTable.$inferSelect;
