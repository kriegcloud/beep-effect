import { CookieNames } from "@beep/notes/lib/storage/cookies";
import { prisma } from "@beep/notes/server/db";
import * as Str from "effect/String";
import { devMiddleware } from "../middlewares/devMiddleware";
import { protectedProcedure } from "../middlewares/procedures";
import { createRouter } from "../trpc";
export const layoutRouter = createRouter({
  app: protectedProcedure.use(devMiddleware(CookieNames.devWaitAppLayout)).query(async ({ ctx }) => {
    const { userId } = ctx;

    const authUser = ctx.user!;

    const { ...currentUser } = await prisma.user.findUniqueOrThrow({
      select: {
        name: true,
        profileImageUrl: true,
      },
      where: {
        id: userId,
      },
    });

    return {
      currentUser: {
        ...currentUser,
        firstName: currentUser.name ? Str.split(" ")(currentUser.name)[0] : "You",
        ...authUser,
      },
    };
  }),
});
