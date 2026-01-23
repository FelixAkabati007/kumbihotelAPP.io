import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { payments, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth";
import {
  paymentCreateSchema,
  paymentStatusUpdateSchema,
} from "../validation/payments";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (_req: Request, res: Response) => {
    try {
      const list = await db.select().from(payments);
      res.json(list);
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
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = paymentCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const { bookingId, amount, currency, method, reference } = parsed.data;
      const [p] = await db
        .insert(payments)
        .values({ bookingId, amount, currency, method, reference })
        .returning();
      const actorUserId = (req as AuthRequest).user?.id ?? null;
      await db.insert(auditLogs).values({
        entityType: "payment",
        entityId: p.id,
        action: "PAYMENT_CREATED",
        actorUserId,
        details: {
          bookingId,
          amount,
          currency,
          method,
        },
      });
      res.status(201).json(p);
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
  "/:id/status",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = paymentStatusUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const { status } = parsed.data;
      const [existing] = await db
        .select()
        .from(payments)
        .where(eq(payments.id, req.params.id))
        .limit(1);
      if (!existing) {
        res.status(404).json({ error: "Payment not found" });
        return;
      }

      const [p] = await db
        .update(payments)
        .set({ status })
        .where(eq(payments.id, req.params.id))
        .returning();

      if (!p) {
        res.status(404).json({ error: "Payment not found" });
        return;
      }

      const actorUserId = (req as AuthRequest).user?.id ?? null;
      await db.insert(auditLogs).values({
        entityType: "payment",
        entityId: p.id,
        action: "PAYMENT_STATUS_UPDATED",
        actorUserId,
        details: {
          previousStatus: existing.status,
          newStatus: status,
        },
      });

      res.json(p);
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
