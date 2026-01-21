import { z } from "zod";

export const roomCreateSchema = z.object({
  roomNumber: z.string().min(1),
  roomType: z.enum(["single", "double", "suite", "deluxe"]),
  capacity: z.number().int().min(1),
  pricePerNight: z.string().regex(/^\d+(\.\d{1,2})?$/),
  amenities: z.array(z.string()).optional(),
  status: z.enum(["available", "occupied", "maintenance"]).optional(),
  images: z.array(z.string().url()).optional(),
  description: z.string().optional(),
});

export const roomUpdateSchema = roomCreateSchema.partial();

export const roomQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  roomType: z.enum(["single", "double", "suite", "deluxe"]).optional(),
  status: z.enum(["available", "occupied", "maintenance"]).optional(),
});
