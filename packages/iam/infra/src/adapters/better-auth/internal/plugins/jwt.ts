import type { BetterAuthPlugin } from "better-auth";
import { jwt } from "better-auth/plugins";

export type JwtOptions = NonNullable<Parameters<typeof jwt>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeJwtPlugin = (opts: JwtOptions): BetterAuthPlugin =>
  jwt(opts satisfies JwtOptions) satisfies BetterAuthPlugin;
