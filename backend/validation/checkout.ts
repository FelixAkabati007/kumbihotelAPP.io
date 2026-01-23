import { z } from "zod";

export const checkoutCreateSchema = z.object({
  roomId: z.string().uuid(),
  checkInDate: z.string().min(10),
  checkOutDate: z.string().min(10),
  specialRequests: z.string().optional(),
  addons: z.array(
    z.object({
      addonId: z.string().uuid(),
      qty: z.number().int().min(1).default(1),
    })
  ).default([]),
  currency: z.string().min(1).default("GHS"),
  method: z.enum(["cash", "card", "mobile_money"]),
  idempotencyKey: z.string().optional(),
});

