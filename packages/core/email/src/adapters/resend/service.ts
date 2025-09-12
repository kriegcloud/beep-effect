import { matchResendError } from "@beep/core-email/adapters/resend/errors";
import { serverEnv } from "@beep/core-env/server";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { Resend } from "resend";

export class ResendService extends Effect.Service<ResendService>()("ResendService", {
  accessors: true,
  dependencies: [],
  effect: Effect.gen(function* () {
    const resend = new Resend(Redacted.value(serverEnv.email.resend.apiKey));

    const send = Effect.fn("ResendService.send")(
      function* (params: Parameters<typeof resend.emails.send>[0]) {
        return yield* Effect.tryPromise({
          try: () => resend.emails.send(params),
          catch: (error) => matchResendError(error, params),
        });
      },
      (effect, params) =>
        effect.pipe(
          Effect.withSpan("ResendService.send", { attributes: { params } }),
          Effect.annotateLogs({ params }),
          Effect.tapError(Effect.logError),
          Effect.mapError((error) => Effect.dieMessage(error.message))
        )
    );

    return {
      resend,
      send,
    };
  }),
}) {}
