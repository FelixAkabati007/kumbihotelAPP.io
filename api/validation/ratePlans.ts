import { z } from "zod";

export const ratePlanCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  currency: z.string().min(1).default("GHS"),
});

export const ratePlanSeasonCreateSchema = z.object({
  ratePlanId: z.string().uuid(),
  startDate: z.string().min(10), // ISO date
  endDate: z.string().min(10),
  dayOfWeekMask: z.string().length(7).regex(/^[01]{7}$/),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

