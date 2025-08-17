import type { BetterAuthPlugin } from "better-auth";
import { oidcProvider } from "better-auth/plugins";

export type OidcProviderOptions = NonNullable<
  Parameters<typeof oidcProvider>[0]
>;

/**
 * TODO factor out
 * @param opts
 */
export const makeOidcProviderPlugin = (opts: OidcProviderOptions) =>
  oidcProvider(opts satisfies OidcProviderOptions) satisfies BetterAuthPlugin;
