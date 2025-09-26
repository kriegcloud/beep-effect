// paths.ts
import { createPath } from "./utils";

// Base builders
const AUTH = createPath("/auth");
const DASHBOARD = createPath("/dashboard");

export const paths = {
  // static
  comingSoon: "/coming-soon",
  maintenance: "/maintenance",
  pricing: "/pricing",
  payment: "/payment",
  about: "/about-us",
  contact: "/contact-us",
  faqs: "/faqs",
  // auth
  auth: {
    signIn: AUTH("sign-in"),
    signUp: AUTH("sign-up"),
    updatePassword: AUTH("update-password"),
    resetPassword: AUTH("reset-password"),
    verify: AUTH("verify"),
    twoFactor: {
      root: AUTH.child("two-factor").root, // "/auth/two-factor"
      otp: AUTH.child("two-factor")("otp"),
    },
    acceptInvitation: AUTH("accept-invitation"),
  },

  // dashboard
  dashboard: {
    root: DASHBOARD.root, // "/dashboard"
    user: {
      root: DASHBOARD.child("user").root, // "/dashboard/user"
      new: DASHBOARD.child("user")("new"),
      list: DASHBOARD.child("user")("list"),
      cards: DASHBOARD.child("user")("cards"),
      account: DASHBOARD.child("user")("account"),
      edit: (id: string) => `${DASHBOARD.child("user").root}/${id}/edit` as const,
    },
  },
} as const;
