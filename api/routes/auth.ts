import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { registerSchema, loginSchema } from "../validation/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
      return;
    }
    const { email, password, fullName, phoneNumber } = parsed.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash: hashedPassword,
        fullName,
        phoneNumber,
        role: "guest",
      })
      .returning();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: "Server misconfiguration" });
      return;
    }
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, secret, {
      expiresIn: "1d",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.flatten() });
      return;
    }
    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    console.log(`Login attempt for ${email}: Found user role=${user?.role}`);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const secretLogin = process.env.JWT_SECRET;
    if (!secretLogin) {
      res.status(500).json({ error: "Server misconfiguration" });
      return;
    }
    const token = jwt.sign({ id: user.id, role: user.role }, secretLogin, {
      expiresIn: "1d",
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res
      .status(500)
      .json({ error: "Internal server error", details: errorMessage });
  }
});

router.post("/logout", async (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
