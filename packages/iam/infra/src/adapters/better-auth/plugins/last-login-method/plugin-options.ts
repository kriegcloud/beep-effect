import type { GenericEndpointContext } from "better-auth";

/**
 * Configuration for tracking different authentication methods
 */
export interface LastLoginMethodOptions {
  /**
   * Name of the cookie to store the last login method
   * @default "better-auth.last_used_login_method"
   */
  cookieName?: string;
  /**
   * Cookie expiration time in seconds
   * @default 2592000 (30 days)
   */
  maxAge?: number;
  /**
   * Custom method to resolve the last login method
   * @param ctx - The context from the hook
   * @returns The last login method
   */
  customResolveMethod?: (ctx: GenericEndpointContext) => string | null;
  /**
   * Store the last login method in the database. This will create a new field in the user table.
   * @default false
   */
  storeInDatabase?: boolean;
  /**
   * Custom schema for the plugin
   * @default undefined
   */
  schema?: {
    user?: {
      lastLoginMethod?: string;
    };
  };
}
