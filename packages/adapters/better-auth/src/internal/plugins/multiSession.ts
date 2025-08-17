import type { BetterAuthPlugin } from "better-auth";
import { multiSession } from "better-auth/plugins";

export type MultiSessionOptions = NonNullable<
  Parameters<typeof multiSession>[0]
>;

/**
 * TODO factor out
 * @param opts
 */
export const makeMultiSessionPlugin = (opts: MultiSessionOptions) =>
  multiSession(opts satisfies MultiSessionOptions) satisfies BetterAuthPlugin;
