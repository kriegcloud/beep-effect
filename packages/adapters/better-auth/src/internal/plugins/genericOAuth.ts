import type { BetterAuthPlugin } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

export type GenericOAuthOptions = NonNullable<
  Parameters<typeof genericOAuth>[0]
>;

/**
 * TODO factor out
 * @param opts
 */
export const makeGenericOAuthPlugin = (opts: GenericOAuthOptions) =>
  genericOAuth(opts satisfies GenericOAuthOptions) satisfies BetterAuthPlugin;
