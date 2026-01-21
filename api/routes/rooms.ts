import { Router, type Request, type Response } from 'express';
import { db } from '../db/index';
import { rooms } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { authenticateToken, requireRole } from '../middleware/auth';
import { roomCreateSchema, roomUpdateSchema, roomQuerySchema } from '../validation/rooms';

const router = Router();

// Get all rooms
router.get('/', async (req: Request, res: Response) => {
  try {
    const parsed = roomQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
      return;
    }
    const { page, limit, roomType, status } = parsed.data;
    const pageNum = page ? Math.max(parseInt(page, 10), 1) : 1;
    const limitNum = limit ? Math.max(parseInt(limit, 10), 1) : 20;
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    if (roomType) whereClauses.push(eq(rooms.roomType, roomType));
    if (status) whereClauses.push(eq(rooms.status, status));

    const list = await db
      .select()
      .from(rooms)
      .where(whereClauses.length ? and(...whereClauses) : undefined)
      .limit(limitNum)
      .offset(offset);

    const payload = { page: pageNum, limit: limitNum, data: list };
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    try {
      const etag = require('crypto').createHash('sha1').update(JSON.stringify(payload)).digest('hex');
      res.setHeader('ETag', etag);
    } catch {}
    res.json(payload);
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
    const parsed = roomCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
      return;
    }
    const [newRoom] = await db.insert(rooms).values(parsed.data).returning();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update room
router.put('/:id', authenticateToken, requireRole(['manager', 'receptionist']), async (req: Request, res: Response) => {
  try {
    const parsed = roomUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
      return;
    }
    const [updatedRoom] = await db.update(rooms).set(parsed.data).where(eq(rooms.id, req.params.id)).returning();
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
