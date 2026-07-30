import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, finalTestQuestionsTable, finalTestResultsTable } from "@workspace/db";
import {
  CreateFinalTestQuestionBody,
  UpdateFinalTestQuestionBody,
  UpdateFinalTestQuestionParams,
  DeleteFinalTestQuestionParams,
  SubmitFinalTestBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/finaltest/questions", async (_req, res): Promise<void> => {
  const questions = await db.select().from(finalTestQuestionsTable)
    .orderBy(finalTestQuestionsTable.orderIndex);
  res.json(questions.map(q => ({
    id: q.id,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    orderIndex: q.orderIndex,
  })));
});

router.post("/finaltest/questions", async (req, res): Promise<void> => {
  const parsed = CreateFinalTestQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [q] = await db.insert(finalTestQuestionsTable).values({
    ...parsed.data,
    orderIndex: parsed.data.orderIndex ?? 0,
  }).returning();
  res.status(201).json({
    id: q.id,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    orderIndex: q.orderIndex,
  });
});

router.patch("/finaltest/questions/:id", async (req, res): Promise<void> => {
  const params = UpdateFinalTestQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateFinalTestQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [q] = await db.update(finalTestQuestionsTable)
    .set(parsed.data)
    .where(eq(finalTestQuestionsTable.id, params.data.id))
    .returning();
  if (!q) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    id: q.id,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    orderIndex: q.orderIndex,
  });
});

router.delete("/finaltest/questions/:id", async (req, res): Promise<void> => {
  const params = DeleteFinalTestQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [q] = await db.delete(finalTestQuestionsTable)
    .where(eq(finalTestQuestionsTable.id, params.data.id))
    .returning();
  if (!q) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/finaltest/submit", async (req, res): Promise<void> => {
  const parsed = SubmitFinalTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { studentName, answers } = parsed.data;
  const questions = await db.select().from(finalTestQuestionsTable);
  const qMap = new Map(questions.map(q => [q.id, q.correctAnswer]));
  let score = 0;
  for (const a of answers) {
    if (qMap.get(a.questionId) === a.selectedAnswer) score++;
  }
  const total = answers.length;
  const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : "0.00";
  const [result] = await db.insert(finalTestResultsTable).values({
    studentName,
    score,
    total,
    percentage,
  }).returning();
  res.json({
    id: result.id,
    studentName: result.studentName,
    score: result.score,
    total: result.total,
    percentage: Number(result.percentage),
    submittedAt: result.submittedAt.toISOString(),
  });
});

router.get("/finaltest/results", async (_req, res): Promise<void> => {
  const results = await db.select().from(finalTestResultsTable)
    .orderBy(finalTestResultsTable.submittedAt);
  res.json(results.map(r => ({
    id: r.id,
    studentName: r.studentName,
    score: r.score,
    total: r.total,
    percentage: Number(r.percentage),
    submittedAt: r.submittedAt.toISOString(),
  })));
});

export default router;
