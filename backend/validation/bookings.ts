import { z } from "zod";

export const bookingCreateSchema = z.object({
  roomId: z.string().uuid(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  specialRequests: z.string().optional(),
});

export const bookingStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "checked_in",
    "checked_out",
    "cancelled",
  ]),
});

export const availabilityQuerySchema = z.object({
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  roomType: z.enum(["single", "double", "suite", "deluxe"]).optional(),
  capacity: z.string().optional(),
});
