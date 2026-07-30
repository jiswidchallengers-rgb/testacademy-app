import { Router, type IRouter } from "express";
import { count, eq, gte, sql } from "drizzle-orm";
import {
  db,
  eligibilityTable,
  mcqQuestionsTable,
  mcqLevelsTable,
  essayTable,
  physicalTable,
  finalTestQuestionsTable,
  finalTestResultsTable,
  studentsTable,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [eligibilityCount] = await db.select({ cnt: count() }).from(eligibilityTable);
  const [essayCount] = await db.select({ cnt: count() }).from(essayTable);
  const [physicalCount] = await db.select({ cnt: count() }).from(physicalTable);
  const [finalTestQuestionCount] = await db.select({ cnt: count() }).from(finalTestQuestionsTable);
  const [finalTestResultCount] = await db.select({ cnt: count() }).from(finalTestResultsTable);
  const [totalLevelsRow] = await db.select({ cnt: count() }).from(mcqLevelsTable);
  const [totalStudentsRow] = await db.select({ cnt: count() }).from(studentsTable);

  // Active students: last seen within 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const [activeStudentsRow] = await db
    .select({ cnt: count() })
    .from(studentsTable)
    .where(gte(studentsTable.lastSeenAt, thirtyDaysAgo));

  // Published content count (eligibility + essays + physical items that are published)
  const [pubEligibility] = await db.select({ cnt: count() }).from(eligibilityTable).where(eq(eligibilityTable.isPublished, true));
  const [pubEssay] = await db.select({ cnt: count() }).from(essayTable).where(eq(essayTable.isPublished, true));
  const [pubPhysical] = await db.select({ cnt: count() }).from(physicalTable).where(eq(physicalTable.isPublished, true));
  const publishedContent = Number(pubEligibility?.cnt ?? 0) + Number(pubEssay?.cnt ?? 0) + Number(pubPhysical?.cnt ?? 0);

  // Count MCQ levels that have at least one question
  const mcqLevelCounts = await db
    .select({ levelId: mcqQuestionsTable.levelId, cnt: count() })
    .from(mcqQuestionsTable)
    .groupBy(mcqQuestionsTable.levelId);
  const mcqLevelsWithQuestions = mcqLevelCounts.length;

  res.json({
    totalStudents: Number(totalStudentsRow?.cnt ?? 0),
    activeStudents: Number(activeStudentsRow?.cnt ?? 0),
    publishedContent,
    totalLevels: Number(totalLevelsRow?.cnt ?? 0),
    eligibilityCount: Number(eligibilityCount?.cnt ?? 0),
    mcqLevelsWithQuestions,
    essayCount: Number(essayCount?.cnt ?? 0),
    physicalCount: Number(physicalCount?.cnt ?? 0),
    finalTestQuestionCount: Number(finalTestQuestionCount?.cnt ?? 0),
    finalTestResultCount: Number(finalTestResultCount?.cnt ?? 0),
  });
});

export default router;
