import { describe, it, expect } from "vitest";
import { DummyPaymentService } from "../../../backend/services/PaymentService";

describe("DummyPaymentService", () => {
  const service = new DummyPaymentService();

  it("should create a payment with pending status", async () => {
    const result = await service.createPayment({
      bookingId: "b1",
      amount: "100",
      method: "cash",
    });
    expect(result.status).toBe("pending");
    expect(result.reference).toContain("DUMMY");
  });

  it("should refund a payment", async () => {
    const result = await service.refund("REF123");
    expect(result.status).toBe("refunded");
    expect(result.reference).toBe("REF123");
  });
});
