import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { payments } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, requireRole } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const list = await db.select().from(payments);
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const [p] = await db.insert(payments).values(req.body).returning();
      res.status(201).json(p);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/:id/status",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const [p] = await db
        .update(payments)
        .set({ status })
        .where(eq(payments.id, req.params.id))
        .returning();
      if (!p) {
        res.status(404).json({ error: "Payment not found" });
        return;
      }
      res.json(p);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
