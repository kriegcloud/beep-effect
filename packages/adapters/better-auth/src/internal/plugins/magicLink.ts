import type { BetterAuthPlugin } from "better-auth";
import { magicLink } from "better-auth/plugins";

export type MagicLinkOptions = NonNullable<Parameters<typeof magicLink>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeMagicLinkPlugin = (opts: MagicLinkOptions) =>
  magicLink(opts satisfies MagicLinkOptions) satisfies BetterAuthPlugin;
