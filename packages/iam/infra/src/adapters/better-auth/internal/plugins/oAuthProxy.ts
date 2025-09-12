import type { BetterAuthPlugin } from "better-auth";
import { oAuthProxy } from "better-auth/plugins";

export type OAuthProxyOptions = NonNullable<Parameters<typeof oAuthProxy>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeOAuthProxyPlugin = (opts: OAuthProxyOptions) =>
  oAuthProxy(opts satisfies OAuthProxyOptions) satisfies BetterAuthPlugin;
