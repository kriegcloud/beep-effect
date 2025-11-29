import { prisma } from "@beep/notes/server/db";
import * as S from "effect/Schema";
import { protectedProcedure } from "../middlewares/procedures";
import { createRouter } from "../trpc";

export const fileMutations = {
  createFile: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          id: S.String,
          appUrl: S.String,
          documentId: S.String,
          size: S.Number,
          type: S.String,
          url: S.String,
        })
      )
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
