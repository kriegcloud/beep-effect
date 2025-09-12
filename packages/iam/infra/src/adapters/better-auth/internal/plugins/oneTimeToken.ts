import type { BetterAuthPlugin } from "better-auth";
import { oneTimeToken } from "better-auth/plugins";

export type OneTimeTokenOptions = NonNullable<Parameters<typeof oneTimeToken>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeOneTimeTokenPlugin = (opts: OneTimeTokenOptions) =>
  oneTimeToken(opts satisfies OneTimeTokenOptions) satisfies BetterAuthPlugin;
