import { phoneNumber } from "better-auth/plugins/phone-number";
import * as Effect from "effect/Effect";

export type PhoneNumberPluginEffect = Effect.Effect<ReturnType<typeof phoneNumber>, never, never>;
export type PhoneNumberPlugin = Effect.Effect.Success<PhoneNumberPluginEffect>;
export const phoneNumberPlugin: PhoneNumberPluginEffect = Effect.succeed(
  phoneNumber(
    //  {} satisfies PhoneNumberOptions
  )
);
