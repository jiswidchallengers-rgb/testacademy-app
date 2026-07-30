import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mcqLevelsTable = pgTable("mcq_levels", {
  id: serial("id").primaryKey(),
  levelNumber: integer("level_number").notNull().unique(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mcqQuestionsTable = pgTable("mcq_questions", {
  id: serial("id").primaryKey(),
  levelId: integer("level_id").notNull().references(() => mcqLevelsTable.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMcqLevelSchema = createInsertSchema(mcqLevelsTable).omit({ id: true, createdAt: true });
export type InsertMcqLevel = z.infer<typeof insertMcqLevelSchema>;
export type McqLevel = typeof mcqLevelsTable.$inferSelect;

export const insertMcqQuestionSchema = createInsertSchema(mcqQuestionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMcqQuestion = z.infer<typeof insertMcqQuestionSchema>;
export type McqQuestion = typeof mcqQuestionsTable.$inferSelect;
