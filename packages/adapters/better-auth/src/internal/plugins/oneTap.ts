import type {BetterAuthPlugin} from "better-auth";
import {oneTap} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof oneTap>[0]>

export const makeOneTapPlugin = (opts: Opts) =>
  oneTap(opts satisfies Opts) satisfies BetterAuthPlugin;