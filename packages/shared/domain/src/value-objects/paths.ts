// paths.ts
import { createPath } from "@beep/constants/paths/utils";
import type { EntityId } from "@beep/schema/EntityId";
import * as F from "effect/Function";

// Base builders
const auth = createPath("/auth");
const twoFactor = auth.child("two-factor");
const verify = auth.child("verify");
const account = (id: EntityId.Type<"account">) => createPath("/account").child(id);
const dashboard = createPath("/dashboard");
const user = dashboard.child("user");
const fileManager = dashboard.child("file-manager");
const organization = (id: EntityId.Type<"organization">) => createPath("/organizations").child(id);

export const paths = {
  // static
  root: "/",
  comingSoon: "/coming-soon",
  maintenance: "/maintenance",
  pricing: "/pricing",
  payment: "/payment",
  about: "/about-us",
  contact: "/contact-us",
  faqs: "/faqs",
  terms: "/terms",
  privacy: "/privacy-policy",
  // auth
  auth: {
    signIn: auth("sign-in"),
    signUp: auth("sign-up"),
    updatePassword: auth("update-password"),
    requestResetPassword: auth("request-reset-password"),
    resetPassword: auth("reset-password"),
    verify: {
      email: verify("email"),
      phone: verify("phone"),
    },
    twoFactor: {
      totp: twoFactor("totp"),
      otp: twoFactor("otp"),
    },
    acceptInvitation: auth("accept-invitation"),
  },
  organizations: F.flow(organization, (o) => ({
    root: o.root,
    edit: o("edit"),
    members: o("members"),
    settings: o("settings"),
  })),
  account: F.flow(account, (a) => ({
    root: a.root,
    edit: a("edit"),
    security: a("security"),
    preferences: a("preferences"),
    notifications: a("notifications"),
  })),
  fileManager: {
    root: fileManager.root,
  },
  // dashboard
  dashboard: {
    root: dashboard.root, // "/dashboard"
    user: {
      root: user.root, // "/dashboard/user"
      account: user("account"),
      edit: (id: EntityId.Type<"user">) => user.child(id)("edit"),
    },
  },
} as const;
