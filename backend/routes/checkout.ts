import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import {
  bookings,
  rooms,
  bookingAddons,
  addons,
  payments,
  invoices,
  auditLogs,
} from "../db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { checkoutCreateSchema } from "../validation/checkout";

type BookingRow = {
  checkInDate: Date | string;
  checkOutDate: Date | string;
};

const router = Router();

router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const parsed = checkoutCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
      return;
    }
    const {
      roomId,
      checkInDate,
      checkOutDate,
      specialRequests,
      addons: addonItems,
      currency,
      method,
      idempotencyKey,
    } = parsed.data;

    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkOut <= checkIn) {
      res.status(400).json({ error: "checkOutDate must be after checkInDate" });
      return;
    }
    // Prevent overlap bookings for the room
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.roomId, roomId));
    const inTime = checkIn.getTime();
    const outTime = checkOut.getTime();
    const hasOverlap = (existingBookings as BookingRow[]).some((b) => {
      const bIn = new Date(b.checkInDate).getTime();
      const bOut = new Date(b.checkOutDate).getTime();
      return bIn < outTime && bOut > inTime;
    });
    if (hasOverlap) {
      res
        .status(409)
        .json({ error: "Room already booked for the requested dates" });
      return;
    }

    // Nights
    const nights = Math.max(
      Math.ceil((outTime - inTime) / (1000 * 60 * 60 * 24)),
      1,
    );
    const roomSubtotal = parseFloat(String(room.pricePerNight)) * nights;

    // Add-ons pricing
    let addonsSubtotal = 0;
    for (const item of addonItems) {
      const [addon] = await db
        .select()
        .from(addons)
        .where(eq(addons.id, item.addonId))
        .limit(1);
      if (!addon) {
        res.status(400).json({ error: `Invalid addonId ${item.addonId}` });
        return;
      }
      const price = parseFloat(String(addon.price)) * item.qty;
      addonsSubtotal += price;
    }
    const subtotal = roomSubtotal + addonsSubtotal;
    const tax = 0; // placeholder; could compute VAT
    const totalAmount = subtotal + tax;

    // Idempotency
    if (idempotencyKey) {
      const existing = await db
        .select()
        .from(bookings)
        .where(eq(bookings.idempotencyKey, idempotencyKey))
        .limit(1);
      if (existing.length > 0) {
        res.status(200).json({ booking: existing[0] });
        return;
      }
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId: user.id,
        roomId,
        checkInDate,
        checkOutDate,
        totalAmount: String(totalAmount),
        status: "pending",
        specialRequests,
        idempotencyKey: idempotencyKey ?? null,
      })
      .returning();

    // Persist add-ons chosen
    for (const item of addonItems) {
      const [addon] = await db
        .select()
        .from(addons)
        .where(eq(addons.id, item.addonId))
        .limit(1);
      if (!addon) continue;
      await db.insert(bookingAddons).values({
        bookingId: newBooking.id,
        addonId: item.addonId,
        qty: item.qty,
        price: String(addon.price),
      });
    }

    // Create payment row
    const [payment] = await db
      .insert(payments)
      .values({
        bookingId: newBooking.id,
        amount: String(totalAmount),
        currency,
        method,
        reference: null,
      })
      .returning();

    // Issue invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        bookingId: newBooking.id,
        currency,
        subtotal: String(subtotal),
        tax: String(tax),
        total: String(totalAmount),
        status: "issued",
      })
      .returning();

    await db.insert(auditLogs).values({
      entityType: "booking",
      entityId: newBooking.id,
      action: "CHECKOUT_CREATED",
      actorUserId: user.id,
      details: { roomId, nights, addons: addonItems, totalAmount },
    });

    res.status(201).json({ booking: newBooking, payment, invoice });
  } catch (error: unknown) {
    console.error("Checkout Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

export default router;
