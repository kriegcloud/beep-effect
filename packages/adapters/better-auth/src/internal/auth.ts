import type { MakePluginsParams } from "@beep/better-auth/internal/makePlugins";
import { makePlugins } from "@beep/better-auth/internal/makePlugins";
import { makeOptions } from "@beep/better-auth/internal/options";
import { type BetterAuthOptions, betterAuth } from "better-auth";

export const makeAuth = (
  opts: BetterAuthOptions,
  // pluginOpts: MakePluginsParams,
) =>
  betterAuth({
    ...makeOptions(opts),
    plugins: [

    ],
  } satisfies BetterAuthOptions);
