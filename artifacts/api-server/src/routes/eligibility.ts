import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, eligibilityTable } from "@workspace/db";
import {
  CreateEligibilityBody,
  UpdateEligibilityBody,
  UpdateEligibilityParams,
  DeleteEligibilityParams,
  PublishEligibilityParams,
  PublishEligibilityBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/eligibility", async (req, res): Promise<void> => {
  const showAll = req.query["all"] === "true";
  let items;
  if (showAll) {
    items = await db.select().from(eligibilityTable).orderBy(eligibilityTable.createdAt);
  } else {
    items = await db.select().from(eligibilityTable)
      .where(eq(eligibilityTable.isPublished, true))
      .orderBy(eligibilityTable.createdAt);
  }
  res.json(items.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  })));
});

router.post("/eligibility", async (req, res): Promise<void> => {
  const parsed = CreateEligibilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(eligibilityTable).values({
    ...parsed.data,
    isPublished: parsed.data.isPublished ?? false,
  }).returning();
  res.status(201).json({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.patch("/eligibility/:id", async (req, res): Promise<void> => {
  const params = UpdateEligibilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEligibilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(eligibilityTable)
    .set(parsed.data)
    .where(eq(eligibilityTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.delete("/eligibility/:id", async (req, res): Promise<void> => {
  const params = DeleteEligibilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(eligibilityTable)
    .where(eq(eligibilityTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/eligibility/:id/publish", async (req, res): Promise<void> => {
  const params = PublishEligibilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = PublishEligibilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(eligibilityTable)
    .set({ isPublished: parsed.data.isPublished })
    .where(eq(eligibilityTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

export default router;
