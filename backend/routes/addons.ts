import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { addons } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, requireRole } from "../middleware/auth";
import { addonCreateSchema } from "../validation/addons";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(addons);
    res.json(list);
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

router.post(
  "/",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = addonCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const taxableInt = parsed.data.taxable ? 1 : 0;
      const [created] = await db
        .insert(addons)
        .values({
          name: parsed.data.name,
          price: parsed.data.price,
          taxable: taxableInt,
        })
        .returning();
      res.status(201).json(created);
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

router.put(
  "/:id",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = addonCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const taxableInt = parsed.data.taxable ? 1 : 0;
      const [updated] = await db
        .update(addons)
        .set({
          name: parsed.data.name,
          price: parsed.data.price,
          taxable: taxableInt,
        })
        .where(eq(addons.id, req.params.id))
        .returning();
      if (!updated) {
        res.status(404).json({ error: "Addon not found" });
        return;
      }
      res.json(updated);
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

router.delete(
  "/:id",
  authenticateToken,
  requireRole(["manager"]),
  async (req: Request, res: Response) => {
    try {
      await db.delete(addons).where(eq(addons.id, req.params.id));
      res.status(204).send();
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
