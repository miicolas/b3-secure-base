import { z } from "zod";

export const productSchema = z.object({
  productName : z.string().min(1),
  price : z.int().min(0),
  imageUrl: z.string().url().optional()
});
