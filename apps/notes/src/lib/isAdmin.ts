import { UserRole } from "@beep/notes/generated/prisma/client";

export const isAdmin = (role?: UserRole) => {
  return isSuperAdmin(role) || role === UserRole.ADMIN;
};

export const isSuperAdmin = (role?: UserRole) => {
  return role === UserRole.SUPERADMIN;
};
