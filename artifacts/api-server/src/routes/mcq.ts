import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, mcqLevelsTable, mcqQuestionsTable } from "@workspace/db";
import {
  CreateMcqQuestionBody,
  CreateMcqQuestionParams,
  UpdateMcqQuestionBody,
  UpdateMcqQuestionParams,
  DeleteMcqQuestionParams,
  ListMcqQuestionsParams,
  SubmitMcqAnswersBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/mcq/levels", async (_req, res): Promise<void> => {
  const levels = await db.select().from(mcqLevelsTable).orderBy(mcqLevelsTable.levelNumber);
  const questionCounts = await db
    .select({ levelId: mcqQuestionsTable.levelId, cnt: count() })
    .from(mcqQuestionsTable)
    .groupBy(mcqQuestionsTable.levelId);

  const countMap = new Map(questionCounts.map(r => [r.levelId, Number(r.cnt)]));
  res.json(levels.map(l => ({
    id: l.id,
    levelNumber: l.levelNumber,
    title: l.title,
    questionCount: countMap.get(l.id) ?? 0,
  })));
});

router.get("/mcq/levels/:levelId/questions", async (req, res): Promise<void> => {
  const params = ListMcqQuestionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const questions = await db.select().from(mcqQuestionsTable)
    .where(eq(mcqQuestionsTable.levelId, params.data.levelId))
    .orderBy(mcqQuestionsTable.orderIndex);
  res.json(questions.map(q => ({
    id: q.id,
    levelId: q.levelId,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    orderIndex: q.orderIndex,
  })));
});

router.post("/mcq/levels/:levelId/questions", async (req, res): Promise<void> => {
  const params = CreateMcqQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateMcqQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [q] = await db.insert(mcqQuestionsTable).values({
    ...parsed.data,
    levelId: params.data.levelId,
    orderIndex: parsed.data.orderIndex ?? 0,
  }).returning();
  res.status(201).json({
    id: q.id,
    levelId: q.levelId,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    orderIndex: q.orderIndex,
  });
});

router.patch("/mcq/questions/:id", async (req, res): Promise<void> => {
  const params = UpdateMcqQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMcqQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [q] = await db.update(mcqQuestionsTable)
    .set(parsed.data)
    .where(eq(mcqQuestionsTable.id, params.data.id))
    .returning();
  if (!q) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    id: q.id,
    levelId: q.levelId,
    question: q.question,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    orderIndex: q.orderIndex,
  });
});

router.delete("/mcq/questions/:id", async (req, res): Promise<void> => {
  const params = DeleteMcqQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [q] = await db.delete(mcqQuestionsTable)
    .where(eq(mcqQuestionsTable.id, params.data.id))
    .returning();
  if (!q) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/mcq/submit", async (req, res): Promise<void> => {
  const parsed = SubmitMcqAnswersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { answers } = parsed.data;
  const questionIds = answers.map(a => a.questionId);
  if (questionIds.length === 0) {
    res.json({ score: 0, total: 0, percentage: 0 });
    return;
  }
  const questions = await db.select().from(mcqQuestionsTable)
    .where(eq(mcqQuestionsTable.levelId, parsed.data.levelId));
  const qMap = new Map(questions.map(q => [q.id, q.correctAnswer]));
  let score = 0;
  for (const a of answers) {
    if (qMap.get(a.questionId) === a.selectedAnswer) score++;
  }
  const total = answers.length;
  const percentage = total > 0 ? (score / total) * 100 : 0;
  res.json({ score, total, percentage });
});

export default router;
