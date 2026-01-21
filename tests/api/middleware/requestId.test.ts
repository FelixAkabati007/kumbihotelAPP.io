import request from "supertest";
import express, { type Request } from "express";
import { describe, it, expect } from "vitest";
import { requestId } from "../../../api/middleware/requestId";

describe("requestId Middleware", () => {
  const app = express();
  app.use(requestId);
  app.get("/test", (req, res) => {
    res.json({
      requestId: (req as Request & { requestId?: string }).requestId,
    });
  });

  it("should assign a request ID if missing", async () => {
    const res = await request(app).get("/test");
    expect(res.status).toBe(200);
    expect(res.headers["x-request-id"]).toBeDefined();
    expect(res.body.requestId).toBeDefined();
  });

  it("should preserve existing request ID", async () => {
    const customId = "custom-id-123";
    const res = await request(app).get("/test").set("X-Request-Id", customId);
    expect(res.status).toBe(200);
    expect(res.headers["x-request-id"]).toBe(customId);
    expect(res.body.requestId).toBe(customId);
  });
});
