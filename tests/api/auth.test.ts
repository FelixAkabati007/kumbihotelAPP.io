import request from "supertest";
import app from "../../backend/app";
import { describe, it, expect } from "vitest";

describe("Auth Routes", () => {
  const testUser = {
    email: `test-${Math.random()}@example.com`,
    password: "password123",
    fullName: "Test User",
    phoneNumber: "1234567890",
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should fail to register with existing email", async () => {
    // Attempt to register same user again
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "User already exists");
  });

  it("should login with valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should fail to login with invalid password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("should fail to login with non-existent user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });
    expect(res.status).toBe(401);
  });

  it("should fail to register with invalid payload", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "invalid-email",
      password: "123", // too short? schema might not check length but good to try
    });
    expect(res.status).toBe(400);
  });

  it("should fail to login with invalid payload", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
    });
    expect(res.status).toBe(400);
  });
});
