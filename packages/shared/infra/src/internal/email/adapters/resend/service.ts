import { type Layer, pipe } from "effect";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { type CreateEmailOptions, type CreateEmailRequestOptions, type CreateEmailResponse, Resend } from "resend";
import { ResendError } from "../resend/errors";

type SendEffect = (
  payload: CreateEmailOptions,
  options?: CreateEmailRequestOptions
) => Effect.Effect<CreateEmailResponse, ResendError, never>;
type ResendServiceEffect = Effect.Effect<
  {
    readonly resend: Resend;
    readonly send: SendEffect;
  },
  never,
  never
>;

const serviceEffect: ResendServiceEffect = Effect.gen(function* () {
  const apiKey = yield* Config.redacted(Config.nonEmptyString("EMAIL_RESEND_API_KEY"));
  const resend = new Resend(Redacted.value(apiKey));

  const send = (
    payload: CreateEmailOptions,
    options?: CreateEmailRequestOptions
  ): Effect.Effect<CreateEmailResponse, ResendError, never> =>
    pipe(
      Effect.tryPromise({
        try: () => resend.emails.send(payload, options),
        catch: (error) => ResendError.new(error, payload),
      }),
      Effect.withSpan("ResendService.send", { attributes: { payload } }),
      Effect.annotateLogs({ payload }),
      Effect.tapError(Effect.logError)
    );

  return {
    send,
    resend,
  };
}).pipe(Effect.catchTag("ConfigError", Effect.die));

export class ResendService extends Effect.Service<ResendService>()("ResendService", {
  accessors: true,
  dependencies: [],
  effect: serviceEffect,
}) {
  static readonly layer: Layer.Layer<ResendService, never, never> = ResendService.Default;
}
