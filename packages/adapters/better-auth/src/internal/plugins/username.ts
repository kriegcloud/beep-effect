import type {BetterAuthPlugin} from "better-auth";
import { username } from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof username>[0]>

export const makeUsernamePlugin = (opts: Opts) =>
  username(opts satisfies Opts) satisfies BetterAuthPlugin;