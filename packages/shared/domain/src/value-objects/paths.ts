import { PathBuilder } from "@beep/constants/paths/utils";
import * as F from "effect/Function";
import type { IamEntityIds, SharedEntityIds } from "../entity-ids";

// Base builders

const auth = PathBuilder.createRoot("/auth");
const twoFactor = auth.child("two-factor");
const device = auth.child("device");
const account = (id: IamEntityIds.AccountId.Type) => PathBuilder.createRoot("/account").child(id);
const dashboard = PathBuilder.createRoot("/dashboard");
const user = dashboard.child("user");
const fileManager = dashboard.child("file-manager");
const organization = (id: SharedEntityIds.OrganizationId.Type) => PathBuilder.createRoot("/organizations").child(id);

export const paths = PathBuilder.collection({
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
    verification: {
      email: F.pipe(
        auth.child("verify-email"),
        (ve) =>
          ({
            root: ve.root,
            verify: (errorMessage: string) => {
              const path = PathBuilder.dynamicQueries(ve.root)({
                errorMessage,
              });
              return path;
            },
            error: (errorMessage: string) => `${ve.root}?errorMessage=${errorMessage}` as const,
          }) as const
      ),
      phone: {
        root: auth.child("phone"),
      },
    },
    twoFactor: {
      totp: twoFactor("totp"),
      otp: twoFactor("otp"),
    },
    acceptInvitation: auth("accept-invitation"),
    device: {
      root: device.root,
      approve: device("approve"),
      denied: device("denied"),
      success: device("success"),
    },
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
    root: dashboard.root,
    user: {
      root: user.root,
      account: user("account"),
      edit: (id: SharedEntityIds.UserId.Type) => user.child(id)("edit"),
    },
  },
} as const);
