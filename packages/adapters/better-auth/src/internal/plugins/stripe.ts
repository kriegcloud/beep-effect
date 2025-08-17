import { stripe } from "@better-auth/stripe";
import type {BetterAuthPlugin} from "better-auth";

type Opts = NonNullable<Parameters<typeof stripe>[0]>

export const makeStripePlugin = (opts: Opts) => stripe(
  opts satisfies Opts
) satisfies BetterAuthPlugin;
