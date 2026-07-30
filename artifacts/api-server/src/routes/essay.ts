import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, essayTable } from "@workspace/db";
import {
  CreateEssayBody,
  UpdateEssayBody,
  UpdateEssayParams,
  DeleteEssayParams,
  PublishEssayParams,
  PublishEssayBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/essays", async (req, res): Promise<void> => {
  const showAll = req.query["all"] === "true";
  let items;
  if (showAll) {
    items = await db.select().from(essayTable).orderBy(essayTable.createdAt);
  } else {
    items = await db.select().from(essayTable)
      .where(eq(essayTable.isPublished, true))
      .orderBy(essayTable.createdAt);
  }
  res.json(items.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  })));
});

router.post("/essays", async (req, res): Promise<void> => {
  const parsed = CreateEssayBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(essayTable).values({
    ...parsed.data,
    isPublished: parsed.data.isPublished ?? false,
  }).returning();
  res.status(201).json({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.patch("/essays/:id", async (req, res): Promise<void> => {
  const params = UpdateEssayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateEssayBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(essayTable)
    .set(parsed.data)
    .where(eq(essayTable.id, params.data.id))
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

router.delete("/essays/:id", async (req, res): Promise<void> => {
  const params = DeleteEssayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(essayTable)
    .where(eq(essayTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/essays/:id/publish", async (req, res): Promise<void> => {
  const params = PublishEssayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = PublishEssayBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(essayTable)
    .set({ isPublished: parsed.data.isPublished })
    .where(eq(essayTable.id, params.data.id))
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
