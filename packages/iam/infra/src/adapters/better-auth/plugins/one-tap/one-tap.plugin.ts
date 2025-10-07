import { IamConfig } from "@beep/iam-infra/config";
import { oneTap } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";

export type OneTapPluginEffect = Effect.Effect<ReturnType<typeof oneTap>, never, IamConfig>;
export type OneTapPlugin = Effect.Effect.Success<OneTapPluginEffect>;

export const oneTapPlugin: OneTapPluginEffect = Effect.gen(function* () {
  const config = yield* IamConfig;
  return oneTap({
    clientId: F.pipe(
      config.oauth.provider.google.clientId,
      O.match({
        onNone: () => "not a real client id",
        onSome: (id) => Redacted.value(id),
      })
    ),
  });
});
