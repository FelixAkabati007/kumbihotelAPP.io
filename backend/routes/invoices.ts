import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { invoices } from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, requireRole, type AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, requireRole(["manager", "receptionist"]), async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(invoices);
    res.json(rows);
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Internal server error", details: errorMessage });
  }
});

router.get("/by-booking/:bookingId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.sendStatus(401);
      return;
    }
    // Managers or owners can view any; guests only own bookings' invoices
    const rows = await db.select().from(invoices).where(eq(invoices.bookingId, req.params.bookingId));
    res.json(rows);
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: "Internal server error", details: errorMessage });
  }
});

export default router;

