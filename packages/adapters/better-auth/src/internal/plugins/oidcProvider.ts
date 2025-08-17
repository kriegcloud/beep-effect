import type {BetterAuthPlugin} from "better-auth";
import {oidcProvider} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof oidcProvider>[0]>

export const makeOidcProviderPlugin = (opts: Opts) =>
  oidcProvider(opts satisfies Opts) satisfies BetterAuthPlugin;