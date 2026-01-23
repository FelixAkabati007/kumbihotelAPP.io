export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod = "cash" | "card" | "mobile_money";

export interface PaymentRequest {
  bookingId: string;
  amount: string;
  currency?: string;
  method: PaymentMethod;
}

export interface PaymentResult {
  status: PaymentStatus;
  reference?: string;
}

export interface PaymentService {
  createPayment(req: PaymentRequest): Promise<PaymentResult>;
  refund(reference: string, amount?: string): Promise<PaymentResult>;
}

export class DummyPaymentService implements PaymentService {
  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    void req;
    return { status: "pending", reference: `DUMMY-${Date.now()}` };
  }
  async refund(reference: string): Promise<PaymentResult> {
    return { status: "refunded", reference };
  }
}
