import type { UserRole } from "@beep/notes/generated/prisma/client";

import { createMiddleware } from "hono/factory";

import type { ProtectedContext } from "./auth-middleware";

export function roleMiddleware(role?: UserRole) {
  return createMiddleware<ProtectedContext>(async (c, next) => {
    if (role) {
      const user = c.get("user");

      if (role === "SUPERADMIN" && !user.isSuperAdmin) {
        return c.json({ error: "Unauthorized" }, 403);
      }
      if (role === "ADMIN" && !user.isAdmin) {
        return c.json({ error: "Unauthorized" }, 403);
      }
    }

    await next();
  });
}
