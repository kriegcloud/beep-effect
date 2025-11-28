import type { UserRole } from "@beep/notes/generated/prisma/client";

import { TRPCError } from "@trpc/server";

import { t } from "../trpc";

export const authorizationMiddleware = ({ role }: { role: UserRole }) =>
  t.middleware(async ({ ctx, next }) => {
    if (role === "ADMIN" && !ctx.user?.isAdmin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Access denied",
      });
    }
    if (role === "SUPERADMIN" && !ctx.user?.isSuperAdmin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Access denied",
      });
    }

    return next({ ctx });
  });
