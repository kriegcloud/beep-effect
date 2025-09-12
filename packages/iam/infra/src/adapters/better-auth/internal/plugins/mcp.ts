import type { BetterAuthPlugin } from "better-auth";
import { mcp } from "better-auth/plugins";

export type McpOptions = NonNullable<Parameters<typeof mcp>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeMcpPlugin = (opts: McpOptions) => mcp(opts satisfies McpOptions) satisfies BetterAuthPlugin;
