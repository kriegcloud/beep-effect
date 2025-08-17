import { dubAnalytics } from "@dub/better-auth";
import type { BetterAuthPlugin } from "better-auth";

export type DubOptions = NonNullable<Parameters<typeof dubAnalytics>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeDubPlugin = (opts: DubOptions) =>
  dubAnalytics(opts satisfies DubOptions) satisfies BetterAuthPlugin;
