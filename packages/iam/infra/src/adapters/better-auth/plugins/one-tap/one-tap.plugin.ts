import { serverEnv } from "@beep/core-env/server";
import { oneTap } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
<<<<<<< HEAD
import type { OneTapOptions } from "./plugin-options";
=======
>>>>>>> auth-type-perf

export type OneTapPluginEffect = Effect.Effect<ReturnType<typeof oneTap>, never, never>;
export type OneTapPlugin = Effect.Effect.Success<OneTapPluginEffect>;

<<<<<<< HEAD
export const oneTapPlugin: OneTapPluginEffect = Effect.succeed(
=======
export const oneTapPlugin = Effect.succeed(
>>>>>>> auth-type-perf
  oneTap({
    clientId: F.pipe(
      serverEnv.oauth.provider.google.clientId,
      O.match({
        onNone: () => "not a real client id",
        onSome: (id) => Redacted.value(id),
      })
    ),
<<<<<<< HEAD
  } satisfies OneTapOptions)
=======
  })
>>>>>>> auth-type-perf
);
