import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import type { HaveIBeenPwnedOptions } from "./plugin-options";
=======
>>>>>>> auth-type-perf

export type HaveIBeenPwnedPluginEffect = Effect.Effect<ReturnType<typeof haveIBeenPwned>, never, never>;
export type HaveIBeenPwnedPlugin = Effect.Effect.Success<HaveIBeenPwnedPluginEffect>;
export const haveIBeenPwnedPlugin: HaveIBeenPwnedPluginEffect = Effect.succeed(
  haveIBeenPwned({
    customPasswordCompromisedMessage:
      "The password you entered has been compromised. Please choose a different password.",
<<<<<<< HEAD
  } satisfies HaveIBeenPwnedOptions)
=======
  })
>>>>>>> auth-type-perf
);
