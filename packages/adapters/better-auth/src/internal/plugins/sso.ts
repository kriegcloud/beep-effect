import type {BetterAuthPlugin} from "better-auth";
import { sso } from "better-auth/plugins/sso";

type Opts = NonNullable<Parameters<typeof sso>[0]>

export const makeSsoPlugin = (opts: Opts) =>
  sso(opts satisfies Opts) satisfies BetterAuthPlugin;