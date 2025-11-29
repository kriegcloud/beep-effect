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

export const getAuthUser = (user: SessionUser | null, devUser?: undefined | string): AuthUser | null => {
  if (!user) return null;

  const baseAuthUser: AuthUser = {
    id: user.id,
    email: user.email,
    isAdmin: isAdmin(user.role),
    isSuperAdmin: isSuperAdmin(user.role) || (user.email ? env.SUPERADMIN.includes(user.email) : false),
    role: user.role,
    username: user.username,
  };

  const devUserData = getDevUser(devUser);

  // Merge dev user data, only overriding if values are defined
  if (devUserData) {
    if (devUserData.isAdmin !== undefined) baseAuthUser.isAdmin = devUserData.isAdmin;
    if (devUserData.isSuperAdmin !== undefined) baseAuthUser.isSuperAdmin = devUserData.isSuperAdmin;
  }

  return baseAuthUser;
};
