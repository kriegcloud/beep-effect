import type {BetterAuthPlugin} from "better-auth";
import {mcp} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof mcp>[0]>

export const makeMcpPlugin = (opts: Opts) =>
  mcp(opts satisfies Opts) satisfies BetterAuthPlugin;