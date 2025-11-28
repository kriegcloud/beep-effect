import { env } from "@beep/notes/env";
import type { UserRole } from "@beep/notes/generated/prisma/client";
import { isAdmin, isSuperAdmin } from "@beep/notes/lib/isAdmin";
import type { SessionUser } from "@beep/notes/server/auth/lucia";

import { getDevUser } from "./getDevUser";

export type AuthUser = {
  id: string;
  email: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: UserRole;
  username: string;
};

export const getAuthUser = (user: SessionUser | null, devUser?: string): AuthUser | null => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    isAdmin: isAdmin(user.role),
    isSuperAdmin: isSuperAdmin(user.role) || env.SUPERADMIN.includes(user.email!),
    role: user.role,
    username: user.username,
    ...getDevUser(devUser),
  };
};
