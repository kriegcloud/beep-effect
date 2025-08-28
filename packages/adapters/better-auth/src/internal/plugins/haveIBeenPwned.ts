import type { BetterAuthPlugin } from "better-auth";
import { haveIBeenPwned } from "better-auth/plugins";

export type HaveIBeenPwnedOptions = NonNullable<Parameters<typeof haveIBeenPwned>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeHaveIBeenPwnedPlugin = (opts: HaveIBeenPwnedOptions) =>
  haveIBeenPwned(opts satisfies HaveIBeenPwnedOptions) satisfies BetterAuthPlugin;
