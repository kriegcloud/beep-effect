import { z } from "zod";

export const idSchema = z.object({
  id: z.string(),
});

export const idsSchema = z.object({
  ids: z.array(z.string()),
});
