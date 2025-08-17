import type {BetterAuthPlugin} from "better-auth";
import {multiSession} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof multiSession>[0]>

export const makeMultiSessionPlugin = (opts: Opts) =>
  multiSession(opts satisfies Opts) satisfies BetterAuthPlugin;