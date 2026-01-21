import { Router, type Request, type Response } from 'express';
import { db } from '../db/index';
import { bookings } from '../db/schema';
import { and, eq, gt, lt } from 'drizzle-orm';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth';
import { bookingCreateSchema, bookingStatusSchema } from '../validation/bookings';

const router = Router();

// Get all bookings (Manager/Receptionist only)
router.get('/', authenticateToken, requireRole(['manager', 'receptionist']), async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Math.max(parseInt(String(req.query.page), 10), 1) : 1;
    const limit = req.query.limit ? Math.max(parseInt(String(req.query.limit), 10), 1) : 20;
    const status = req.query.status ? String(req.query.status) : undefined;
    const offset = (page - 1) * limit;

    const where = status ? eq(bookings.status, status as any) : undefined;

    const list = await db.select().from(bookings).where(where).limit(limit).offset(offset);
    res.json({ page, limit, data: list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my bookings (Guest)
router.get('/my-bookings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      res.sendStatus(401);
      return;
    }
    
    const myBookings = await db.select().from(bookings).where(eq(bookings.userId, userId));
    res.json(myBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create booking
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
       res.status(401).json({error: "Unauthorized"});
       return;
    }

    const parsed = bookingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
      return;
    }
    const { roomId, checkInDate, checkOutDate, totalAmount, specialRequests } = parsed.data;

    const idempotencyKey = req.header('Idempotency-Key');
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

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      res.status(400).json({ error: 'checkOutDate must be after checkInDate' });
      return;
    }

    // Overlap rule: (existing.check_in < requested.check_out) AND (existing.check_out > requested.check_in)
    const overlapping = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, roomId),
          lt(bookings.checkInDate, checkOutDate as unknown as Date),
          gt(bookings.checkOutDate, checkInDate as unknown as Date)
        )
      )
      .limit(1);
    if (overlapping.length > 0) {
      res.status(409).json({ error: 'Room already booked for the requested dates' });
      return;
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId,
        roomId,
        checkInDate: checkInDate as unknown as Date,
        checkOutDate: checkOutDate as unknown as Date,
        totalAmount,
        status: 'pending',
        specialRequests,
        idempotencyKey: idempotencyKey ?? null,
      })
      .returning();

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status (Staff)
router.put('/:id/status', authenticateToken, requireRole(['manager', 'receptionist']), async (req: Request, res: Response) => {
  try {
    const parsed = bookingStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
      return;
    }
    const { status } = parsed.data;
    const [updatedBooking] = await db.update(bookings).set({ status }).where(eq(bookings.id, req.params.id)).returning();
    if (!updatedBooking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
