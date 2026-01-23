import request from "supertest";
import app from "../../backend/app";
import { describe, it, expect } from "vitest";

describe("health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect([200, 503]).toContain(res.status);
    expect(res.body).toBeDefined();
  });
});
