import type { BetterAuthPlugin } from "better-auth";
import { oneTap } from "better-auth/plugins";

export type OneTapOptions = NonNullable<Parameters<typeof oneTap>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeOneTapPlugin = (opts: OneTapOptions) =>
  oneTap(opts satisfies OneTapOptions) satisfies BetterAuthPlugin;
