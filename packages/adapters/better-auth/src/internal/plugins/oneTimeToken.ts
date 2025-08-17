import type {BetterAuthPlugin} from "better-auth";
import {oneTimeToken} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof oneTimeToken>[0]>

export const makeOneTimeTokenPlugin = (opts: Opts) =>
  oneTimeToken(opts satisfies Opts) satisfies BetterAuthPlugin;