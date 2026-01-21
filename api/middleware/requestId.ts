import { type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "crypto";

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = (req.headers["x-request-id"] as string) || randomUUID();
  (req as any).requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
};
