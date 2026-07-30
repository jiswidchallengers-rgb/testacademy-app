import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const finalTestQuestionsTable = pgTable("final_test_questions", {
  id: serial("id").primaryKey(),
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

export const finalTestResultsTable = pgTable("final_test_results", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFinalTestQuestionSchema = createInsertSchema(finalTestQuestionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFinalTestQuestion = z.infer<typeof insertFinalTestQuestionSchema>;
export type FinalTestQuestion = typeof finalTestQuestionsTable.$inferSelect;

export const insertFinalTestResultSchema = createInsertSchema(finalTestResultsTable).omit({ id: true, submittedAt: true });
export type InsertFinalTestResult = z.infer<typeof insertFinalTestResultSchema>;
export type FinalTestResult = typeof finalTestResultsTable.$inferSelect;
