import { Router, type Request, type Response } from 'express';
import { db } from '../db/index';
import { rooms } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get all rooms
router.get('/', async (req: Request, res: Response) => {
  try {
    const allRooms = await db.select().from(rooms);
    res.json(allRooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get room by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, req.params.id)).limit(1);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create room (Admin/Manager)
router.post('/', authenticateToken, requireRole(['manager', 'receptionist']), async (req: Request, res: Response) => {
  try {
    const [newRoom] = await db.insert(rooms).values(req.body).returning();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update room
router.put('/:id', authenticateToken, requireRole(['manager', 'receptionist']), async (req: Request, res: Response) => {
  try {
    const [updatedRoom] = await db.update(rooms).set(req.body).where(eq(rooms.id, req.params.id)).returning();
    if (!updatedRoom) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(updatedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete room
router.delete('/:id', authenticateToken, requireRole(['manager']), async (req: Request, res: Response) => {
  try {
    const [deletedRoom] = await db.delete(rooms).where(eq(rooms.id, req.params.id)).returning();
    if (!deletedRoom) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(deletedRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
