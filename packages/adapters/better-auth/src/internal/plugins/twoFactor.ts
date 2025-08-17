import type {BetterAuthPlugin} from "better-auth";
import {twoFactor} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof twoFactor>[0]>

export const makeTwoFactorPlugin = (opts: Opts) =>
  twoFactor(opts satisfies Opts) satisfies BetterAuthPlugin;