import type { BetterAuthPlugin } from "better-auth";
import { username } from "better-auth/plugins";

export type UsernameOptions = NonNullable<Parameters<typeof username>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeUsernamePlugin = (opts: UsernameOptions) =>
  username(opts satisfies UsernameOptions) satisfies BetterAuthPlugin;
