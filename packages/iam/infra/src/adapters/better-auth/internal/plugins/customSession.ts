import type { BetterAuthPlugin } from "better-auth";
import { customSession } from "better-auth/plugins";

export type CustomSessionOptions = NonNullable<Parameters<typeof customSession>[0]>;
/**
 * TODO factor out
 * @param opts
 */
export const makeCustomSessionPlugin = (opts: CustomSessionOptions) =>
  customSession(opts satisfies CustomSessionOptions) satisfies BetterAuthPlugin;
