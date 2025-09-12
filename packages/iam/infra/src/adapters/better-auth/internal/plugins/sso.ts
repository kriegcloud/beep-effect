import type { BetterAuthPlugin } from "better-auth";
import { sso } from "better-auth/plugins/sso";

export type SsoOptions = NonNullable<Parameters<typeof sso>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeSsoPlugin = (opts: SsoOptions) => sso(opts satisfies SsoOptions) satisfies BetterAuthPlugin;
