import request from "supertest";
import app from "../../api/app";

describe("bookings", () => {
  it("requires auth on create", async () => {
    const res = await request(app).post("/api/bookings").send({});
    expect(res.status).toBe(401);
  });
});
