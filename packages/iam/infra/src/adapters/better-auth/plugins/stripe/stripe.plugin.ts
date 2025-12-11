import { serverEnv } from "@beep/shared-infra/ServerEnv";
import { stripe } from "@better-auth/stripe";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { Stripe } from "stripe";

// These are placeholders
// TODO MAKE REAL.
const PRO_PRICE_ID = {
  default: "price_1RoxnRHmTADgihIt4y8c0lVE",
  annual: "price_1RoxnoHmTADgihItzFvVP8KT",
} as const;

const PLUS_PRICE_ID = {
  default: "price_1RoxnJHmTADgihIthZTLmrPn",
  annual: "price_1Roxo5HmTADgihItEbJu5llL",
} as const;

const stripeOptions = Effect.gen(function* () {
  return {
    stripeClient: new Stripe(Redacted.value(serverEnv.payment.stripe.key) || "sk_test_"),
    stripeWebhookSecret: Redacted.value(serverEnv.payment.stripe.webhookSecret),
    subscription: {
      enabled: false,
      plans: [
        {
          name: "plus",
          priceId: PLUS_PRICE_ID.default,
          annualDiscountPriceId: PLUS_PRICE_ID.annual,
          freeTrial: {
            days: 7,
          },
        },
        {
          name: "pro",
          priceId: PRO_PRICE_ID.default,
          annualDiscountPriceId: PRO_PRICE_ID.annual,
          freeTrial: {
            days: 7,
          },
        },
      ],
    },
  };
});

type Options = Effect.Effect.Success<typeof stripeOptions>;

export type StripePluginEffect = Effect.Effect<ReturnType<typeof stripe<Options>>, never, never>;
export type StripePlugin = Effect.Effect.Success<StripePluginEffect>;

export const stripePlugin: StripePluginEffect = Effect.gen(function* () {
  const options = yield* stripeOptions;
  return stripe(options);
});
