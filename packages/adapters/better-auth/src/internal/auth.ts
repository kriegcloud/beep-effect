import { makeOptions } from "@beep/better-auth/internal/options";
import { type BetterAuthOptions, betterAuth } from "better-auth";

export const makeAuth = (options: BetterAuthOptions) =>
  betterAuth(makeOptions(options));
