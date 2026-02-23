import { prisma } from "@beep/notes/server/db";
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { protectedProcedure } from "../middlewares/procedures";
import { createRouter } from "../trpc";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PROFILE_IMAGE_URL_LENGTH = 500;

export const userRouter = createRouter({
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.user.delete({
      where: { id: ctx.userId },
    });

    return { success: true };
  }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      select: {
        email: true,
        name: true,
        profileImageUrl: true,
      },
      where: { id: ctx.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }),

  getUser: protectedProcedure.input(S.decodeUnknownSync(S.Struct({ id: S.String }))).query(async ({ input }) => {
    return await prisma.user.findUnique({
      select: {
        email: true,
        name: true,
        profileImageUrl: true,
      },
      where: { id: input.id },
    });
  }),

  updateSettings: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          email: BS.EmailBase.pipe(S.maxLength(MAX_EMAIL_LENGTH)).pipe(S.optional),
          name: S.optional(S.Trimmed.pipe(S.minLength(1), S.maxLength(MAX_NAME_LENGTH))),
          profileImageUrl: BS.URLString.pipe(S.maxLength(MAX_PROFILE_IMAGE_URL_LENGTH)),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: UnsafeTypes.UnsafeAny = {};
      if (input.email !== undefined) updateData.email = input.email;
      if (input.name !== undefined) updateData.name = input.name;
      if (input.profileImageUrl !== undefined) updateData.profileImageUrl = input.profileImageUrl;

      return await prisma.user.update({
        data: updateData,
        where: { id: ctx.userId },
      });
    }),

  users: protectedProcedure
    .input(
      S.decodeUnknownSync(
        S.Struct({
          cursor: S.optional(S.String),
          limit: S.optionalWith(S.Number.pipe(S.greaterThan(1), S.lessThan(100)), { default: () => 10 }),
          search: S.optional(S.String),
        })
      )
    )
    .query(async ({ input }) => {
      const { cursor, limit, search } = input;

      const findManyOptions: UnsafeTypes.UnsafeAny = {
        orderBy: { name: "asc" },
        select: {
          id: true,
          email: true,
          name: true,
          profileImageUrl: true,
        },
        take: limit + 1,
      };
      if (cursor) findManyOptions.cursor = { id: cursor };
      if (search) {
        findManyOptions.where = {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        };
      }

      const users = await prisma.user.findMany(findManyOptions);

      let nextCursor: typeof cursor | undefined;

      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: users,
        nextCursor,
      };
    }),
});
