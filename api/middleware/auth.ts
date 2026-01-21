import { type Request, type Response, type NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface UserTokenPayload {
  id: string;
  role: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "",
    {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
    (err, decoded) => {
      if (err || !decoded || typeof decoded === "string") {
        console.error("JWT Verification Failed:", err?.message);
        res.sendStatus(403);
        return;
      }
      const payload = decoded as UserTokenPayload;
      // console.log("JWT Verified for user:", payload.id, "role:", payload.role);
      (req as AuthRequest).user = {
        id: payload.id,
        role: payload.role,
      };
      next();
    },
  );
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user || !roles.includes(user.role)) {
      console.error(
        `Role Check Failed: Required [${roles}], Found ${user?.role} (User ID: ${user?.id})`,
      );
      res.sendStatus(403);
      return;
    }
    // console.log(`Role Check Passed: Required [${roles}], Found ${user.role}`);
    next();
  };
};
