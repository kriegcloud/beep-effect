import { prisma } from "@beep/notes/server/db";
import type { UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { z } from "zod";
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
      z.object({
        email: z.email().max(MAX_EMAIL_LENGTH, "Email is too long").optional(),
        name: z.string().min(1, "Name is required").max(MAX_NAME_LENGTH, "Name is too long").trim().optional(),
        profileImageUrl: z
          .url("Invalid URL")
          .max(MAX_PROFILE_IMAGE_URL_LENGTH, "Profile image URL is too long")
          .optional(),
      })
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
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
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
