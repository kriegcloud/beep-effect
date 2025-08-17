import type {BetterAuthPlugin} from "better-auth";
import {genericOAuth} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof genericOAuth>[0]>

export const makeGenericOAuthPlugin = (opts: Opts) => genericOAuth(opts satisfies Opts) satisfies BetterAuthPlugin;