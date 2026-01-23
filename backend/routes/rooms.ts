import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { rooms } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { authenticateToken, requireRole } from "../middleware/auth";
import {
  roomCreateSchema,
  roomUpdateSchema,
  roomQuerySchema,
} from "../validation/rooms";
import { createHash } from "crypto";

const router = Router();

// Get all rooms
router.get("/", async (req: Request, res: Response) => {
  try {
    const parsed = roomQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid query", details: parsed.error.flatten() });
      return;
    }
    const { page, limit, roomType, status } = parsed.data;
    const pageNum = page ? Math.max(parseInt(page, 10), 1) : 1;
    const limitNum = limit ? Math.max(parseInt(limit, 10), 1) : 20;
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    if (roomType) whereClauses.push(eq(rooms.roomType, roomType));
    if (status) whereClauses.push(eq(rooms.status, status));

    const baseQuery = db.select().from(rooms);
    const list = await (
      whereClauses.length ? baseQuery.where(and(...whereClauses)) : baseQuery
    )
      .limit(limitNum)
      .offset(offset);

    const payload = { page: pageNum, limit: limitNum, data: list };
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300",
    );
    const etag = createHash("sha1")
      .update(JSON.stringify(payload))
      .digest("hex");
    res.setHeader("ETag", etag);
    res.json(payload);
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

// Get room by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const [room] = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, req.params.id))
      .limit(1);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json(room);
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

// Create room (Admin/Manager)
router.post(
  "/",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = roomCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const values = {
        ...parsed.data,
        amenities: parsed.data.amenities ?? [],
        status: parsed.data.status ?? "available",
        images: parsed.data.images ?? [],
      } as typeof rooms.$inferInsert;

      const [newRoom] = await db.insert(rooms).values(values).returning();
      res.status(201).json(newRoom);
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

// Update room
router.put(
  "/:id",
  authenticateToken,
  requireRole(["manager", "receptionist"]),
  async (req: Request, res: Response) => {
    try {
      const parsed = roomUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Invalid payload", details: parsed.error.flatten() });
        return;
      }
      const updateValues = parsed.data as Partial<typeof rooms.$inferInsert>;
      const [updatedRoom] = await db
        .update(rooms)
        .set(updateValues)
        .where(eq(rooms.id, req.params.id))
        .returning();
      if (!updatedRoom) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      res.json(updatedRoom);
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

// Delete room
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["manager"]),
  async (req: Request, res: Response) => {
    try {
      const [deletedRoom] = await db
        .delete(rooms)
        .where(eq(rooms.id, req.params.id))
        .returning();
      if (!deletedRoom) {
        res.status(404).json({ error: "Room not found" });
        return;
      }
      res.json(deletedRoom);
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
