import { z } from "zod";

export const cursorSchema = z.object({
  cursor: z.string().optional(),
});

export const querySchema = z.object({
  q: z.string().optional(),
});
