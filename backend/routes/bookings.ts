import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { bookings, auditLogs, rooms, users } from "../db/schema";
import { eq, and, getTableColumns } from "drizzle-orm";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth";
import {
  bookingCreateSchema,
  bookingStatusSchema,
} from "../validation/bookings";

type BookingRow = {
  checkInDate: Date | string;
  checkOutDate: Date | string;
};

const router = Router();

// Get all bookings (Manager/Receptionist only)
router.get(
  "/",
  authenticateToken,
  requireRole(["admin", "manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const page = req.query.page
        ? Math.max(parseInt(String(req.query.page), 10), 1)
        : 1;
      const limit = req.query.limit
        ? Math.max(parseInt(String(req.query.limit), 10), 1)
        : 20;
      const statusParam = req.query.status
        ? String(req.query.status)
        : undefined;
      const offset = (page - 1) * limit;

      const allowedStatuses = [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ] as const;
      type BookingStatus = (typeof allowedStatuses)[number];
      const status =
        statusParam && allowedStatuses.includes(statusParam as BookingStatus)
          ? (statusParam as BookingStatus)
          : undefined;

      const where = status ? eq(bookings.status, status) : undefined;

      const list = await db
        .select({
          ...getTableColumns(bookings),
          userName: users.fullName,
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .where(where)
        .limit(limit)
        .offset(offset);
      res.json({ page, limit, data: list });
    } catch (error: unknown) {
      console.error("List Bookings Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

// Get my bookings (Guest)
router.get(
  "/my-bookings",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.sendStatus(401);
        return;
      }

      const myBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId));
      res.json(myBookings);
    } catch (error: unknown) {
      console.error("My Bookings Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res
        .status(500)
        .json({ error: "Internal server error", details: errorMessage });
    }
  },
);

// Create booking
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = bookingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
      return;
    }
    const { roomId, checkInDate, checkOutDate, totalAmount, specialRequests } =
      parsed.data;
    const safeUserId = userId as string;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Check if room exists
    const roomExists = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (roomExists.length === 0) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const idempotencyKey = req.header("Idempotency-Key");
    if (idempotencyKey) {
      const existing = await db
        .select()
        .from(bookings)
        .where(eq(bookings.idempotencyKey, idempotencyKey))
        .limit(1);
      if (existing.length > 0) {
        res.status(200).json(existing[0]);
        return;
      }
    }

    if (checkOut <= checkIn) {
      res.status(400).json({ error: "checkOutDate must be after checkInDate" });
      return;
    }

    // Overlap rule: (existing.check_in < requested.check_out) AND (existing.check_out > requested.check_in)
    const roomBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.roomId, roomId));
    const checkInTime = checkIn.getTime();
    const checkOutTime = checkOut.getTime();
    const hasOverlap = (roomBookings as BookingRow[]).some((b) => {
      const existingIn = new Date(b.checkInDate).getTime();
      const existingOut = new Date(b.checkOutDate).getTime();
      return existingIn < checkOutTime && existingOut > checkInTime;
    });
    if (hasOverlap) {
      res
        .status(409)
        .json({ error: "Room already booked for the requested dates" });
      return;
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId: safeUserId,
        roomId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        totalAmount,
        status: "pending",
        specialRequests,
        idempotencyKey: idempotencyKey ?? null,
      })
      .returning();

    await db.insert(auditLogs).values({
      entityType: "booking",
      entityId: newBooking.id,
      action: "BOOKING_CREATED",
      actorUserId: safeUserId,
      details: {
        roomId,
        checkInDate,
        checkOutDate,
        totalAmount,
      },
    });

    res.status(201).json(newBooking);
  } catch (error: unknown) {
    console.error("Create Booking Error:", error);
    if (typeof error === "object" && error !== null) {
      const pgError = error as { code?: string; detail?: string };
      if (pgError.code) console.error("Error Code:", pgError.code);
      if (pgError.detail) console.error("Error Detail:", pgError.detail);
    }
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

// Update booking status (Staff)
router.put(
  "/:id/status",
  authenticateToken,
  requireRole(["admin", "manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = bookingStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const { status } = parsed.data;
      const [existingBooking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, req.params.id))
        .limit(1);
      if (!existingBooking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      const [updatedBooking] = await db
        .update(bookings)
        .set({ status })
        .where(eq(bookings.id, req.params.id))
        .returning();
      if (!updatedBooking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
      const actor = (req as AuthRequest).user?.id ?? null;
      await db.insert(auditLogs).values({
        entityType: "booking",
        entityId: updatedBooking.id,
        action: "BOOKING_STATUS_CHANGED",
        actorUserId: actor,
        details: {
          previousStatus: existingBooking.status,
          newStatus: status,
        },
      });
      res.json(updatedBooking);
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Cancel my booking (Guest)
router.post(
  "/:id/cancel",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const bookingId = req.params.id;

      const [booking] = await db
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
        .limit(1);

      if (!booking) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }

      if (booking.status === "cancelled") {
        res.status(400).json({ error: "Booking is already cancelled" });
        return;
      }

      if (
        booking.status &&
        ["checked_in", "checked_out"].includes(booking.status as string)
      ) {
        res.status(400).json({
          error:
            "Cannot cancel a booking that has already started or completed",
        });
        return;
      }

      const [updatedBooking] = await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.id, bookingId))
        .returning();

      await db.insert(auditLogs).values({
        entityType: "booking",
        entityId: bookingId,
        action: "BOOKING_CANCELLED",
        actorUserId: userId,
        details: {
          previousStatus: booking.status,
        },
      });

      res.json(updatedBooking);
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
