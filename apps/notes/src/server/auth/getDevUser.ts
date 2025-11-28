import { env } from "@beep/notes/env";

export type DevUser = {
  isAdmin?: boolean;
  isSubscribed?: boolean;
  isSuperAdmin?: boolean;
};

export const getDevUser = (devUserStr?: string) => {
  if (env.NODE_ENV === "production" || !devUserStr) return null;

  const devUser = JSON.parse(devUserStr);

  const res: DevUser = {};

  if (devUser.role && devUser.role !== "DEFAULT") {
    res.isAdmin = devUser.role === "ADMIN";
    res.isSuperAdmin = devUser.role === "SUPERADMIN";
  }
  // if (devUser.plan && devUser.plan !== 'default') {
  //   res.isSubscribed = devUser.plan !== SubscriptionPlan.Free;
  // }

  return res;
};
