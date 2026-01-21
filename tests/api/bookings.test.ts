import request from "supertest";
import app from "../../api/app";
import { db } from "../../api/db/index";
import { users, rooms, bookings } from "../../api/db/schema";
import { eq } from "drizzle-orm";
import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";

describe("Bookings Routes", () => {
  let guestToken: string;
  let managerToken: string;
  let roomId: string;
  let bookingId: string;

  const guestEmail = `guest-book-${Math.random()}@example.com`;
  const managerEmail = `mgr-book-${Math.random()}@example.com`;
  const password = "password123";

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Guest
    await db
      .insert(users)
      .values({
        email: guestEmail,
        passwordHash: hashedPassword,
        fullName: "Guest Booker",
        role: "guest",
      })
      .returning();
    const guestLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: guestEmail, password });
    guestToken = guestLogin.body.token;

    // Create Manager
    await db
      .insert(users)
      .values({
        email: managerEmail,
        passwordHash: hashedPassword,
        fullName: "Manager Booker",
        role: "manager",
      })
      .returning();
    const mgrLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: managerEmail, password });
    managerToken = mgrLogin.body.token;

    // Create Room
    const [room] = await db
      .insert(rooms)
      .values({
        roomNumber: `B-${Math.floor(Math.random() * 10000)}`,
        roomType: "double",
        capacity: 2,
        pricePerNight: "150.00",
        status: "available",
      })
      .returning();
    roomId = room.id;
  });

  it("should create a booking", async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 1);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 3);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        roomId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        totalAmount: "300.00",
      });

    if (res.status !== 201) console.error("Create Booking Failed:", res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.status).toBe("pending");
    bookingId = res.body.id;
  });

  it("should prevent double booking", async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 1);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 3);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        roomId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        totalAmount: "300.00",
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Room already booked/i);
  });

  it("guest should see their bookings", async () => {
    const res = await request(app)
      .get("/api/bookings/my-bookings")
      .set("Authorization", `Bearer ${guestToken}`);
    if (res.status !== 200) console.error("Guest Bookings Failed:", res.body);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.find((b: { id: string }) => b.id === bookingId),
    ).toBeDefined();
  });

  it("manager should see all bookings", async () => {
    const res = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${managerToken}`);
    if (res.status !== 200) console.error("Manager Bookings Failed:", res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should cancel a booking", async () => {
    const res = await request(app)
      .post(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");

    // Verify in DB
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));
    expect(booking.status).toBe("cancelled");
  });

  it("should return 400 for invalid booking creation data", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        roomId,
        checkInDate: "invalid-date",
        checkOutDate: "invalid-date",
        totalAmount: "300.00",
      });
    expect(res.status).toBe(400);
  });

  it("should return 404 if room does not exist", async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 10);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 12);

    const randomUuid = "00000000-0000-0000-0000-000000000000"; // Valid UUID format

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        roomId: randomUuid,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        totalAmount: "300.00",
      });
    expect(res.status).toBe(404);
  });

  it("should filter bookings by status for manager", async () => {
    const res = await request(app)
      .get("/api/bookings?status=pending")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should handle pagination for manager", async () => {
    const res = await request(app)
      .get("/api/bookings?page=1&limit=5")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
  });

  it("should deny guest access to update booking status", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/status`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({ status: "confirmed" });
    expect(res.status).toBe(403);
  });

  it("manager should update booking status", async () => {
    // Create a new booking for update test
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 20);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 22);

    const createRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        roomId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        totalAmount: "200.00",
      });
    const newBookingId = createRes.body.id;

    const res = await request(app)
      .put(`/api/bookings/${newBookingId}/status`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ status: "confirmed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("confirmed");
  });

  it("should return 400 for invalid status update", async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/status`)
      .set("Authorization", `Bearer ${managerToken}`)
      .send({ status: "invalid_status" });
    expect(res.status).toBe(400);
  });

  it("should validate check-out date is after check-in date", async () => {
    const date = new Date().toISOString().split("T")[0];
    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        roomId,
        checkInDate: date,
        checkOutDate: date, // Same date
        totalAmount: "100.00",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/checkOutDate must be after checkInDate/i);
  });

  it("should handle idempotency key", async () => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 30);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 32);
    const idempotencyKey = `unique-key-${Math.random()}`;

    // First request
    const res1 = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .set("Idempotency-Key", idempotencyKey)
      .send({
        roomId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        totalAmount: "200.00",
      });
    expect(res1.status).toBe(201);

    // Second request with same key
    const res2 = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .set("Idempotency-Key", idempotencyKey)
      .send({
        roomId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        totalAmount: "200.00",
      });
    expect(res2.status).toBe(200);
    expect(res2.body.id).toBe(res1.body.id);
  });

  it("should fail to cancel non-existent booking", async () => {
    const res = await request(app)
      .post("/api/bookings/00000000-0000-0000-0000-000000000000/cancel")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(404);
  });

  it("should fail to cancel someone else's booking", async () => {
    // Manager creates a booking
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 40);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 42);

    const mgrBookingRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        roomId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        totalAmount: "200.00",
      });
    const mgrBookingId = mgrBookingRes.body.id;

    // Guest tries to cancel it
    const res = await request(app)
      .post(`/api/bookings/${mgrBookingId}/cancel`)
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(404); // Or 403, but implementation filters by userId so it returns 404 "Not found" (for this user)
  });

  it("should fail to cancel an already cancelled booking", async () => {
    // Create and cancel
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 50);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 52);

    const createRes = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        roomId,
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        totalAmount: "200.00",
      });
    const id = createRes.body.id;

    await request(app)
      .post(`/api/bookings/${id}/cancel`)
      .set("Authorization", `Bearer ${guestToken}`);

    // Try cancel again
    const res = await request(app)
      .post(`/api/bookings/${id}/cancel`)
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already cancelled/i);
  });

  it("should fail to cancel a checked-in booking", async () => {
    // Manually create a checked-in booking
    const checkIn = new Date();
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 2);
    
    const [booking] = await db.insert(bookings).values({
      userId: (await db.select().from(users).where(eq(users.email, guestEmail))).pop()!.id,
      roomId,
      checkInDate: checkIn.toISOString().split("T")[0],
      checkOutDate: checkOut.toISOString().split("T")[0],
      totalAmount: "200.00",
      status: "checked_in",
    }).returning();

    const res = await request(app)
      .post(`/api/bookings/${booking.id}/cancel`)
      .set("Authorization", `Bearer ${guestToken}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Cannot cancel a booking that has already started/i);
  });

  it("should deny guest access to list all bookings", async () => {
    const res = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(403);
  });
});
