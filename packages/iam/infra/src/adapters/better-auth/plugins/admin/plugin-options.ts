import type { AuthPluginSchema, InferOptionSchema } from "better-auth";
import type { AccessControl, Role } from "better-auth/plugins/access";

const schema = {
  user: {
    fields: {
      role: {
        type: "string",
        required: false,
        input: false,
      },
      banned: {
        type: "boolean",
        defaultValue: false,
        required: false,
        input: false,
      },
      banReason: {
        type: "string",
        required: false,
        input: false,
      },
      banExpires: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  session: {
    fields: {
      impersonatedBy: {
        type: "string",
        required: false,
      },
    },
  },
} satisfies AuthPluginSchema;

type AdminSchema = typeof schema;
export interface AdminOptions {
  /**
   * The default role for a user
   *
   * @default "user"
   */
  defaultRole?: string;
  /**
   * Roles that are considered admin roles.
   *
   * Any user role that isn't in this list, even if they have the permission,
   * will not be considered an admin.
   *
   * @default ["admin"]
   */
  adminRoles?: string | string[];
  /**
   * A default ban reason
   *
   * By default, no reason is provided
   */
  defaultBanReason?: string;
  /**
   * Number of seconds until the ban expires
   *
   * By default, the ban never expires
   */
  defaultBanExpiresIn?: number;
  /**
   * Duration of the impersonation session in seconds
   *
   * By default, the impersonation session lasts 1 hour
   */
  impersonationSessionDuration?: number;
  /**
   * Custom schema for the admin plugin
   */
  schema?: InferOptionSchema<AdminSchema>;
  /**
   * Configure the roles and permissions for the admin
   * plugin.
   */
  ac?: AccessControl;
  /**
   * Custom permissions for roles.
   */
  roles?: {
    [key in string]?: Role;
  };
  /**
   * List of user ids that should have admin access
   *
   * If this is set, the `adminRole` option is ignored
   */
  adminUserIds?: string[];
  /**
   * Message to show when a user is banned
   *
   * By default, the message is "You have been banned from this application"
   */
  bannedUserMessage?: string;
}
