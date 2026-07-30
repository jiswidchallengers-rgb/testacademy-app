import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const essayTable = pgTable("essay_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEssaySchema = createInsertSchema(essayTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEssay = z.infer<typeof insertEssaySchema>;
export type Essay = typeof essayTable.$inferSelect;
