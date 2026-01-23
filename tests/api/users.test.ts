import request from "supertest";
import app from "../../backend/app";
import { db } from "../../backend/db/index";
import { users, auditLogs } from "../../backend/db/schema";
import { describe, it, expect, beforeAll } from "vitest";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

describe("Users Routes", () => {
  let managerToken: string;
  let guestToken: string;
  let guestId: string;
  const managerEmail = `mgr-${Math.random()}@example.com`;
  const guestEmail = `guest-${Math.random()}@example.com`;
  const password = "password123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Setup Manager
    await db
      .insert(users)
      .values({
        email: managerEmail,
        passwordHash: hashedPassword,
        fullName: "Manager",
        phoneNumber: "111",
        role: "manager",
      })
      .returning();

    const mgrLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: managerEmail, password });

    if (mgrLogin.status !== 200) {
      throw new Error(
        `Manager login failed: ${mgrLogin.status} ${JSON.stringify(mgrLogin.body)}`,
      );
    }
    managerToken = mgrLogin.body.token;

    // Setup Guest
    const [guest] = await db
      .insert(users)
      .values({
        email: guestEmail,
        passwordHash: hashedPassword,
        fullName: "Guest",
        phoneNumber: "222",
        role: "guest",
      })
      .returning();
    guestId = guest.id;

    const guestLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: guestEmail, password });

    if (guestLogin.status !== 200) {
      throw new Error("Guest login failed");
    }
    guestToken = guestLogin.body.token;
  });

  it("manager should list all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("guest should NOT list all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(403);
  });

  it("guest should view own profile", async () => {
    const res = await request(app)
      .get(`/api/users/${guestId}`)
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(guestEmail);
  });

  it("guest should NOT view other profile", async () => {
    const mgrRes = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${managerToken}`);

    if (mgrRes.status !== 200) {
      console.error("Manager List Users Failed:", mgrRes.status, mgrRes.body);
      // Fail the test immediately if manager can't list users
      expect(mgrRes.status).toBe(200);
      return;
    }

    const mgrUser = mgrRes.body.find(
      (u: { email: string; id: string }) => u.email === managerEmail,
    );
    if (!mgrUser) {
      console.error("Manager email not found in list:", mgrRes.body);
      throw new Error("Manager user not found in list");
    }
    const mgrId = mgrUser.id;

    const res = await request(app)
      .get(`/api/users/${mgrId}`)
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(403);
  });

  it("manager should view any profile", async () => {
    const res = await request(app)
      .get(`/api/users/${guestId}`)
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(guestId);
  });

  it("guest should update own profile", async () => {
    const newName = "Updated Guest Name";
    const res = await request(app)
      .put(`/api/users/${guestId}`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({ fullName: newName });

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe(newName);

    // Verify Audit Log
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, guestId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe("USER_UPDATED");
    expect(logs[0].actorUserId).toBe(guestId);
  });

  it("guest should NOT update other profile", async () => {
    // Find manager ID again
    const mgrUser = await db
      .select()
      .from(users)
      .where(eq(users.email, managerEmail))
      .limit(1);
    const mgrId = mgrUser[0].id;

    const res = await request(app)
      .put(`/api/users/${mgrId}`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({ fullName: "Hacked Name" });

    expect(res.status).toBe(403);
  });

  it("should return 400 for invalid update payload", async () => {
    const res = await request(app)
      .put(`/api/users/${guestId}`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({ fullName: "" }); // empty string is invalid based on min(1)

    expect(res.status).toBe(400);
  });

  it("should return 404 for non-existent user", async () => {
    const res = await request(app)
      .get("/api/users/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(404);
  });

  it("should return 404 when updating non-existent user", async () => {
    const res = await request(app)
      .put("/api/users/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ fullName: "New Name" });
    expect(res.status).toBe(404);
  });
});
