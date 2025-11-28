import { prisma } from "@beep/notes/server/db";
import { z } from "zod";

import { protectedProcedure } from "../middlewares/procedures";
import { createRouter } from "../trpc";

export const fileMutations = {
  createFile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        appUrl: z.string(),
        documentId: z.string(),
        size: z.number(),
        type: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.file.create({
        data: {
          id: input.id,
          appUrl: input.appUrl,
          documentId: input.documentId,
          size: input.size,
          type: input.type,
          url: input.url,
          userId: ctx.userId,
        },
      });
    }),
};

export const fileRouter = createRouter({
  ...fileMutations,
});
