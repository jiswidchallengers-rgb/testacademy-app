import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, physicalTable } from "@workspace/db";
import {
  CreatePhysicalBody,
  UpdatePhysicalBody,
  UpdatePhysicalParams,
  DeletePhysicalParams,
  PublishPhysicalParams,
  PublishPhysicalBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/physical", async (req, res): Promise<void> => {
  const showAll = req.query["all"] === "true";
  let items;
  if (showAll) {
    items = await db.select().from(physicalTable).orderBy(physicalTable.createdAt);
  } else {
    items = await db.select().from(physicalTable)
      .where(eq(physicalTable.isPublished, true))
      .orderBy(physicalTable.createdAt);
  }
  res.json(items.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  })));
});

router.post("/physical", async (req, res): Promise<void> => {
  const parsed = CreatePhysicalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(physicalTable).values({
    ...parsed.data,
    isPublished: parsed.data.isPublished ?? false,
  }).returning();
  res.status(201).json({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
});

router.patch("/physical/:id", async (req, res): Promise<void> => {
  const params = UpdatePhysicalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePhysicalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(physicalTable)
    .set(parsed.data)
    .where(eq(physicalTable.id, params.data.id))
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

router.delete("/physical/:id", async (req, res): Promise<void> => {
  const params = DeletePhysicalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(physicalTable)
    .where(eq(physicalTable.id, params.data.id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/physical/:id/publish", async (req, res): Promise<void> => {
  const params = PublishPhysicalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = PublishPhysicalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(physicalTable)
    .set({ isPublished: parsed.data.isPublished })
    .where(eq(physicalTable.id, params.data.id))
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
