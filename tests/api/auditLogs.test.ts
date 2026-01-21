import request from "supertest";
import app from "../../api/app";
import { db } from "../../api/db/index";
import { users } from "../../api/db/schema";
import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";

describe("AuditLogs Routes", () => {
  let managerToken: string;
  let guestToken: string;

  const managerEmail = `mgr-audit-${Math.random()}@example.com`;
  const guestEmail = `guest-audit-${Math.random()}@example.com`;
  const password = "password123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Manager
    const [insertedMgr] = await db
      .insert(users)
      .values({
        email: managerEmail,
        passwordHash: hashedPassword,
        fullName: "Manager Audit",
        role: "manager",
      })
      .returning();
    console.log("Inserted Manager:", insertedMgr);

    const mgrLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: managerEmail, password });

    if (mgrLogin.status !== 200) {
      console.error("Manager Login Failed:", mgrLogin.body);
    } else {
      console.log("Manager Login Success:", mgrLogin.body.user);
    }
    managerToken = mgrLogin.body.token;

    // Create Guest
    await db
      .insert(users)
      .values({
        email: guestEmail,
        passwordHash: hashedPassword,
        fullName: "Guest Audit",
        role: "guest",
      })
      .returning();
    const guestLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: guestEmail, password });
    guestToken = guestLogin.body.token;
  });

  it("should list audit logs for manager", async () => {
    const res = await request(app)
      .get("/api/audit-logs")
      .set("Authorization", `Bearer ${managerToken}`);
    if (res.status !== 200) console.error("Audit Logs Failed:", res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should deny access to guest", async () => {
    const res = await request(app)
      .get("/api/audit-logs")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(403);
  });

  it("should filter logs by entityType", async () => {
    const res = await request(app)
      .get("/api/audit-logs?entityType=payment")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should return 400 for invalid entityType", async () => {
    const res = await request(app)
      .get("/api/audit-logs?entityType=INVALID_TYPE")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid entityType");
  });

  it("should handle pagination", async () => {
    const res = await request(app)
      .get("/api/audit-logs?page=1&limit=5")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
  });

  it("should filter logs by entityId", async () => {
    // Get a log first
    const logsRes = await request(app)
      .get("/api/audit-logs")
      .set("Authorization", `Bearer ${managerToken}`);
    
    if (logsRes.body.data.length > 0) {
      const entityId = logsRes.body.data[0].entityId;
      const res = await request(app)
        .get(`/api/audit-logs?entityId=${entityId}`)
        .set("Authorization", `Bearer ${managerToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].entityId).toBe(entityId);
    }
  });

  it("should filter logs by entityType and entityId", async () => {
    // Get a log first
    const logsRes = await request(app)
      .get("/api/audit-logs")
      .set("Authorization", `Bearer ${managerToken}`);
    
    if (logsRes.body.data.length > 0) {
      const log = logsRes.body.data[0];
      const res = await request(app)
        .get(`/api/audit-logs?entityType=${log.entityType}&entityId=${log.entityId}`)
        .set("Authorization", `Bearer ${managerToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].entityType).toBe(log.entityType);
      expect(res.body.data[0].entityId).toBe(log.entityId);
    }
  });
});
