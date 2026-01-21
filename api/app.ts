import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import roomRoutes from "./routes/rooms";
import bookingRoutes from "./routes/bookings";
import { requestId } from "./middleware/requestId";
import { logger } from "./logger";
import { authLimiter, bookingLimiter } from "./middleware/rateLimit";
import paymentRoutes from "./routes/payments";
import auditLogRoutes from "./routes/auditLogs";
import userRoutes from "./routes/users";
import { initSentry } from "./sentry";

interface RequestWithId extends Request {
  requestId?: string;
}

// load env
dotenv.config();

const app: express.Application = express();

initSentry();
app.disable("x-powered-by");
app.use(requestId);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
  })
);
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req: RequestWithId, res: Response, next: NextFunction) => {
  const start = Date.now();
  logger.info(
    { req: { method: req.method, url: req.url }, requestId: req.requestId },
    "request_start"
  );
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      {
        res: { statusCode: res.statusCode },
        duration,
        requestId: req.requestId,
      },
      "request_end"
    );
  });
  next();
});

/**
 * API Routes
 */
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingLimiter, bookingRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/users", userRoutes);

/**
 * health
 */
app.use("/api/health", (_req: Request, res: Response): void => {
  if (!process.env.DATABASE_URL) {
    res.status(503).json({ success: false, message: "db unavailable" });
    return;
  }
  import("./db/index")
    .then(async ({ pool }) => {
      try {
        await pool.query("select 1");
        res.status(200).json({ success: true, message: "ok", db: "up" });
      } catch {
        res.status(503).json({ success: false, message: "db unavailable" });
      }
    })
    .catch(() => {
      res.status(503).json({ success: false, message: "db unavailable" });
    });
});

/**
 * error handler middleware
 */
app.use(
  (error: Error, req: RequestWithId, res: Response, _next: NextFunction) => {
    void _next;
    logger.error({ err: error, requestId: req.requestId }, "unhandled_error");
    res.status(500).json({
      success: false,
      error: "Server internal error",
      requestId: req.requestId,
    });
  }
);

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "API not found",
  });
});

export default app;
