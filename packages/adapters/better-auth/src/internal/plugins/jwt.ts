import type {BetterAuthPlugin} from "better-auth";
import {jwt} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof jwt>[0]>

export const makeJwtPlugin = (opts: Opts) =>
  jwt(opts satisfies Opts) satisfies BetterAuthPlugin;