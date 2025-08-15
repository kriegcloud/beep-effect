import { makePlugins } from "@beep/better-auth/internal/plugins";
import type { BetterAuthOptions } from "better-auth";

export const makeOptions = (
  plugins: BetterAuthOptions["plugins"],
  options: Omit<BetterAuthOptions, "plugins">
)=> ({
  plugins: makePlugins(plugins).plugins,
  ...options,
} satisfies BetterAuthOptions)