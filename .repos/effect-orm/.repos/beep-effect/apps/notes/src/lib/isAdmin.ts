import { UserRole } from "@beep/notes/generated/prisma/client";

export const isAdmin = (role?: undefined | UserRole) => {
  return isSuperAdmin(role) || role === UserRole.ADMIN;
};

export const isSuperAdmin = (role?: undefined | UserRole) => {
  return role === UserRole.SUPERADMIN;
};
