import { Router, type Request, type Response } from 'express';
import { db } from '../db/index';
import { bookings } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth';

const router = Router();

// Get all bookings (Manager/Receptionist only)
router.get('/', authenticateToken, requireRole(['manager', 'receptionist']), async (req: Request, res: Response) => {
  try {
    const allBookings = await db.select().from(bookings);
    res.json(allBookings);
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
    
    const [newBooking] = await db.insert(bookings).values({
      ...req.body,
      userId: userId, // Ensure userId comes from token
      status: 'pending'
    }).returning();
    
    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status (Staff)
router.put('/:id/status', authenticateToken, requireRole(['manager', 'receptionist']), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
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
