<<<<<<< HEAD
// import type {PhoneNumberOptions} from "./plugin-options";
=======
>>>>>>> auth-type-perf
import { phoneNumber } from "better-auth/plugins/phone-number";
import * as Effect from "effect/Effect";

export type PhoneNumberPluginEffect = Effect.Effect<ReturnType<typeof phoneNumber>, never, never>;
export type PhoneNumberPlugin = Effect.Effect.Success<PhoneNumberPluginEffect>;
<<<<<<< HEAD
export const phoneNumberPlugin: PhoneNumberPluginEffect = Effect.succeed(
=======
export const phoneNumberPlugin = Effect.succeed(
>>>>>>> auth-type-perf
  phoneNumber(
    //  {} satisfies PhoneNumberOptions
  )
);
