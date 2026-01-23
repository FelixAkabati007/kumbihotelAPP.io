import { z } from "zod";

export const paymentCreateSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().min(1).default("GHS"),
  method: z.enum(["cash", "card", "mobile_money"]),
  reference: z.string().optional(),
});

export const paymentStatusUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "refunded", "failed"]),
});
