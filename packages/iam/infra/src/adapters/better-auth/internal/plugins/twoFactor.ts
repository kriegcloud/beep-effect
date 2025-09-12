import type { BetterAuthPlugin } from "better-auth";
import { twoFactor } from "better-auth/plugins";

export type TwoFactorOptions = NonNullable<Parameters<typeof twoFactor>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeTwoFactorPlugin = (opts: TwoFactorOptions) =>
  twoFactor(opts satisfies TwoFactorOptions) satisfies BetterAuthPlugin;
