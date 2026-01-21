import request from "supertest";
import app from "../../api/app";
import { db } from "../../api/db/index";
import { users } from "../../api/db/schema";
import { eq } from "drizzle-orm";
import { describe, it, expect, beforeAll } from "vitest";

describe("Rooms Routes", () => {
  let token: string;
  let roomId: string;
  const managerEmail = `manager-${Math.random()}@example.com`;
  const managerPassword = "password123";

  beforeAll(async () => {
    // 1. Register
    const regRes = await request(app).post("/api/auth/register").send({
      email: managerEmail,
      password: managerPassword,
      fullName: "Test Manager",
      phoneNumber: "1234567890",
    });

    if (regRes.status !== 201)
      console.error("Rooms Test Reg Failed:", regRes.body);

    // 2. Update role to manager directly in DB
    await db
      .update(users)
      .set({ role: "manager" })
      .where(eq(users.email, managerEmail));

    // 3. Login
    const loginRes = await request(app).post("/api/auth/login").send({
      email: managerEmail,
      password: managerPassword,
    });
    token = loginRes.body.token;
  });

  it("should create a new room", async () => {
    const res = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        roomNumber: `R-${Math.floor(Math.random() * 10000)}`,
        roomType: "single",
        capacity: 1,
        pricePerNight: "100.00",
        description: "A nice room",
      });
    if (res.status !== 201) console.error("Create Room Failed:", res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    roomId = res.body.id;
  });

  it("should get all rooms", async () => {
    const res = await request(app).get("/api/rooms");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should get room by id", async () => {
    const res = await request(app).get(`/api/rooms/${roomId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", roomId);
  });

  it("should return 404 for non-existent room", async () => {
    const res = await request(app).get(
      "/api/rooms/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status).toBe(404);
  });

  it("should update room details", async () => {
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        pricePerNight: "150.00",
        description: "Updated description",
      });
    expect(res.status).toBe(200);
    expect(res.body.pricePerNight).toBe("150.00");
  });

  it("should return 400 for invalid update payload", async () => {
    const res = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        pricePerNight: "invalid-price",
      });
    expect(res.status).toBe(400);
  });

  it("should delete room", async () => {
    const res = await request(app)
      .delete(`/api/rooms/${roomId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("should return 404 when deleting non-existent room", async () => {
    const res = await request(app)
      .delete(`/api/rooms/${roomId}`) // Already deleted
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
