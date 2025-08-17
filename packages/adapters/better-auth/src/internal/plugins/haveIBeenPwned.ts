import type {BetterAuthPlugin} from "better-auth";
import {haveIBeenPwned} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof haveIBeenPwned>[0]>

export const makeHaveIBeenPwnedPlugin = (opts: Opts) =>
  haveIBeenPwned(opts satisfies Opts) satisfies BetterAuthPlugin;