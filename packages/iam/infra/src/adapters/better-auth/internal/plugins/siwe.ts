import type { BetterAuthPlugin } from "better-auth";
import { siwe } from "better-auth/plugins";

export type SiweOptions = NonNullable<Parameters<typeof siwe>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeSiwePlugin = (opts: SiweOptions) => siwe(opts satisfies SiweOptions) satisfies BetterAuthPlugin;
