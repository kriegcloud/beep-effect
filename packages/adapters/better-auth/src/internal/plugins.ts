import type { BetterAuthOptions } from "better-auth";

export const makePlugins = (plugins: BetterAuthOptions["plugins"]) => ({
  plugins,
} satisfies BetterAuthOptions)