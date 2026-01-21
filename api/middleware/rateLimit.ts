import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "60", 10) * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || "20", 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

export const bookingLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "60", 10) * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || "10", 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});
