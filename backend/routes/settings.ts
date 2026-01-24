import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { settings } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const settingUpdateSchema = z.object({
  value: z.string(),
  description: z.string().optional(),
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(settings);
    res.json(list);
  } catch (error: unknown) {
    console.error("Settings fetch error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "42P01"
    ) {
      console.error(
        "CRITICAL: 'settings' table missing. Run 'npm run db:push' to create tables.",
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

router.get("/:key", async (req: Request, res: Response) => {
  try {
    const [item] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, req.params.key));
    if (!item) {
      res.status(404).json({ error: "Setting not found" });
      return;
    }
    res.json(item);
  } catch (error: unknown) {
    console.error("Settings fetch error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "42P01"
    ) {
      console.error(
        "CRITICAL: 'settings' table missing. Run 'npm run db:push' to create tables.",
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

router.put(
  "/:key",
  authenticateToken,
  requireRole(["manager"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = settingUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }

      // Upsert logic
      const [existing] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, req.params.key));

      if (existing) {
        const [updated] = await db
          .update(settings)
          .set({
            value: parsed.data.value,
            description: parsed.data.description,
            updatedAt: new Date(),
          })
          .where(eq(settings.key, req.params.key))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db
          .insert(settings)
          .values({
            key: req.params.key,
            value: parsed.data.value,
            description: parsed.data.description,
          })
          .returning();
        res.status(201).json(created);
      }
    } catch (error: unknown) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

export default router;
