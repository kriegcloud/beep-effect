import type {BetterAuthPlugin} from "better-auth";
import {oAuthProxy} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof oAuthProxy>[0]>

export const makeOAuthProxyPlugin = (opts: Opts) =>
  oAuthProxy(opts satisfies Opts) satisfies BetterAuthPlugin;