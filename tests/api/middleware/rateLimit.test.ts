import request from "supertest";
import express from "express";
import { describe, it, expect } from "vitest";
import { authLimiter } from "../../../backend/middleware/rateLimit";

describe("Rate Limit Middleware", () => {
  const app = express();
  app.use("/auth", authLimiter);
  app.get("/auth/test", (req, res) => res.send("ok"));

  it("should allow requests under limit", async () => {
    const res = await request(app).get("/auth/test");
    expect(res.status).toBe(200);
  });
});
