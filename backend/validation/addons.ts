import { z } from "zod";

export const addonCreateSchema = z.object({
  name: z.string().min(2),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  taxable: z.boolean().default(false),
});

