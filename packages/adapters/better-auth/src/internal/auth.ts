// import type { MakePluginsParams } from "@beep/better-auth/internal/makePlugins";
// import { makePlugins } from "@beep/better-auth/internal/makePlugins";
import { makeOptions } from "@beep/better-auth/internal/options";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import type { AuthOptions } from "./options";

export type Auth = ReturnType<typeof betterAuth<AuthOptions>>;

export const makeAuth: (opts: BetterAuthOptions) => Auth = (
  opts: BetterAuthOptions,
  // pluginOpts: MakePluginsParams,
) => betterAuth(makeOptions(opts));
