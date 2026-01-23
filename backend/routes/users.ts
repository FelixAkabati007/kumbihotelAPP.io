import { Router, type Request, type Response } from "express";
import { db } from "../db/index";
import { users, auditLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  authenticateToken,
  requireRole,
  type AuthRequest,
} from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Validation schema for updating user details
const userUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
});

// Get all users (Manager only)
router.get(
  "/",
  authenticateToken,
  requireRole(["manager"]),
  async (req: Request, res: Response) => {
    try {
      const allUsers = await db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          phoneNumber: users.phoneNumber,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users);
      res.json(allUsers);
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

// Get user by ID (Manager or Self)
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const requestUser = (req as AuthRequest).user;
    if (!requestUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Allow managers to view anyone, or users to view themselves
    if (requestUser.role !== "manager" && requestUser.id !== req.params.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.params.id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

// Update user details (Manager or Self)
router.put("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const requestUser = (req as AuthRequest).user;
    if (!requestUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (requestUser.role !== "manager" && requestUser.id !== req.params.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = userUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
      return;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.params.id))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        role: users.role,
        updatedAt: users.updatedAt,
      });

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await db.insert(auditLogs).values({
      entityType: "user",
      entityId: updatedUser.id,
      action: "USER_UPDATED",
      actorUserId: requestUser.id,
      details: parsed.data,
    });

    res.json(updatedUser);
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

export default router;
