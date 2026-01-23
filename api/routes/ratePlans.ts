import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { ratePlans, ratePlanSeasons, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth";
import {
  ratePlanCreateSchema,
  ratePlanSeasonCreateSchema,
} from "../validation/ratePlans";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requireRole(["manager"]),
  async (_req: Request, res: Response) => {
    try {
      const plans = await db.select().from(ratePlans);
      res.json(plans);
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

router.post(
  "/",
  authenticateToken,
  requireRole(["manager"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = ratePlanCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const [plan] = await db
        .insert(ratePlans)
        .values({
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          currency: parsed.data.currency,
        })
        .returning();
      const actor = (req as AuthRequest).user?.id ?? null;
      await db.insert(auditLogs).values({
        entityType: "user",
        entityId: actor ?? plan.id,
        action: "RATE_PLAN_CREATED",
        actorUserId: actor,
        details: parsed.data,
      });
      res.status(201).json(plan);
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
  requireRole(["manager"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = ratePlanCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const [updated] = await db
        .update(ratePlans)
        .set({
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          currency: parsed.data.currency,
        })
        .where(eq(ratePlans.id, req.params.id))
        .returning();
      if (!updated) {
        res.status(404).json({ error: "Rate plan not found" });
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
      const [existing] = await db
        .select()
        .from(ratePlans)
        .where(eq(ratePlans.id, req.params.id))
        .limit(1);
      if (!existing) {
        res.status(404).json({ error: "Rate plan not found" });
        return;
      }
      await db.delete(ratePlans).where(eq(ratePlans.id, req.params.id));
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

// Seasons
router.get(
  "/:id/seasons",
  authenticateToken,
  requireRole(["manager"]),
  async (req: Request, res: Response) => {
    try {
      const seasons = await db
        .select()
        .from(ratePlanSeasons)
        .where(eq(ratePlanSeasons.ratePlanId, req.params.id));
      res.json(seasons);
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

router.post(
  "/:id/seasons",
  authenticateToken,
  requireRole(["manager"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = ratePlanSeasonCreateSchema.safeParse({
        ...req.body,
        ratePlanId: req.params.id,
      });
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const [season] = await db
        .insert(ratePlanSeasons)
        .values({
          ratePlanId: parsed.data.ratePlanId,
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate,
          dayOfWeekMask: parsed.data.dayOfWeekMask,
          price: parsed.data.price,
        })
        .returning();
      res.status(201).json(season);
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
