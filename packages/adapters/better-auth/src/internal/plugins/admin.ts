import type {BetterAuthPlugin} from "better-auth";
import {admin} from "better-auth/plugins";
import type {
  AdminOptions
} from "better-auth/plugins/admin";

export const makeAdminPlugin = (opts: AdminOptions) => admin({
  defaultRole: opts.defaultRole,
  adminRoles: opts.adminRoles,
  defaultBanReason: opts.defaultBanReason,
  defaultBanExpiresIn: opts.defaultBanExpiresIn,
  impersonationSessionDuration: opts.impersonationSessionDuration,
  schema: opts.schema,
  ac: opts.ac,
  roles: opts.roles,
  adminUserIds: opts.adminUserIds,
  bannedUserMessage: opts.bannedUserMessage,
} satisfies AdminOptions) satisfies BetterAuthPlugin;
