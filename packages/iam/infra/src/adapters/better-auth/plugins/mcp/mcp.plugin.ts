import { mcp } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import type { MCPOptions } from "./plugin-options";

export type McpPluginEffect = Effect.Effect<ReturnType<typeof mcp>, never, never>;
export type McpPlugin = Effect.Effect.Success<McpPluginEffect>;
export const mcpPlugin: McpPluginEffect = Effect.succeed(
  mcp({
    loginPage: "/auth/sign-in",
  } satisfies MCPOptions)
);
