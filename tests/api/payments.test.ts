import request from "supertest";
import app from "../../api/app";
import { db } from "../../api/db/index";
import { users, rooms, bookings } from "../../api/db/schema";
import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";

describe("Payments Routes", () => {
  let managerToken: string;
  let bookingId: string;
  let paymentId: string;

  const managerEmail = `mgr-pay-${Math.random()}@example.com`;
  const password = "password123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Manager
    const [manager] = await db
      .insert(users)
      .values({
        email: managerEmail,
        passwordHash: hashedPassword,
        fullName: "Manager Pay",
        role: "manager",
      })
      .returning();
    const mgrLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: managerEmail, password });
    managerToken = mgrLogin.body.token;

    // Create Room & Booking
    const [room] = await db
      .insert(rooms)
      .values({
        roomNumber: `R${Math.floor(Math.random() * 1000)}`, // Max 5 chars
        roomType: "single",
        pricePerNight: "200.00",
        status: "occupied", // Assume occupied
        capacity: 2,
      })
      .returning();

    const [booking] = await db
      .insert(bookings)
      .values({
        userId: manager.id, // Manager booking for simplicity
        roomId: room.id,
        checkInDate: new Date().toISOString().split("T")[0],
        checkOutDate: new Date(Date.now() + 86400000)
          .toISOString()
          .split("T")[0],
        status: "confirmed",
        totalAmount: "200.00",
      })
      .returning();
    bookingId = booking.id;
  });

  it("should create a payment", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        bookingId,
        amount: "200.00",
        currency: "GHS",
        method: "cash",
        reference: "REF123",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.status).toBe("pending"); // Default in schema usually
    paymentId = res.body.id;
  });

  it("should update payment status", async () => {
    const res = await request(app)
      .put(`/api/payments/${paymentId}/status`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ status: "paid" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("paid");
  });

  it("should list all payments", async () => {
    const res = await request(app)
      .get("/api/payments")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.find((p: { id: string }) => p.id === paymentId),
    ).toBeDefined();
  });

  it("should fail to create payment with invalid payload", async () => {
    const res = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        bookingId,
        amount: "invalid-amount", // Invalid
        currency: "GHS",
        method: "cash",
      });
    expect(res.status).toBe(400);
  });

  it("should return 404 when updating non-existent payment", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .put(`/api/payments/${fakeId}/status`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ status: "paid" });
    expect(res.status).toBe(404);
  });
});
