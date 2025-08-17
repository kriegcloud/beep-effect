import { stripe } from "@better-auth/stripe";
import type { BetterAuthPlugin } from "better-auth";

export type StripeOptions = NonNullable<Parameters<typeof stripe>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeStripePlugin = (opts: StripeOptions) =>
  stripe(opts satisfies StripeOptions) satisfies BetterAuthPlugin;
