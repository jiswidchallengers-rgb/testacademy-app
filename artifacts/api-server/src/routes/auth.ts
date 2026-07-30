import { Router, type IRouter } from "express";
import { LoginBody, StudentLoginBody } from "@workspace/api-zod";
import { db, studentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const ADMIN_EMAIL = "amanuo118@gmail.com";
const ADMIN_PASSWORD = "Amankhan123@";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.userEmail = email;
    req.session.userRole = "admin";
    req.session.userName = undefined;
    res.json({ email, role: "admin", name: null });
    return;
  }

  res.status(401).json({ error: "Invalid credentials" });
});

router.post("/auth/student-login", async (req, res): Promise<void> => {
  const parsed = StudentLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name } = parsed.data;
  const trimmedName = name.trim();

  if (!trimmedName) {
    res.status(400).json({ error: "Name cannot be empty" });
    return;
  }

  // Upsert student record
  const existing = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.name, trimmedName))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(studentsTable)
      .set({ lastSeenAt: sql`now()` })
      .where(eq(studentsTable.id, existing[0].id));
  } else {
    await db.insert(studentsTable).values({ name: trimmedName });
  }

  req.session.userRole = "student";
  req.session.userName = trimmedName;
  req.session.userEmail = undefined;

  res.json({ email: null, role: "student", name: trimmedName });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userRole) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (req.session.userRole === "admin") {
    res.json({ email: req.session.userEmail, role: "admin", name: null });
    return;
  }

  if (req.session.userRole === "student") {
    // Update lastSeenAt
    if (req.session.userName) {
      await db
        .update(studentsTable)
        .set({ lastSeenAt: sql`now()` })
        .where(eq(studentsTable.name, req.session.userName));
    }
    res.json({ email: null, role: "student", name: req.session.userName ?? null });
    return;
  }

  res.status(401).json({ error: "Not authenticated" });
});

export default router;
