import { $SharedServerId } from "@beep/identity/packages";
import { render } from "@react-email/render";
import { type Layer, pipe } from "effect";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type React from "react";
import { type CreateEmailOptions, type CreateEmailRequestOptions, type CreateEmailResponse, Resend } from "resend";
import { EmailTemplateRenderError, ResendError } from "./errors";

const $I = $SharedServerId.create("internal/email/adapters/resend/service");

type RenderEmail = (
  // biome-ignore lint/suspicious/noExplicitAny: React type requires any for JSXElementConstructor
  element: React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
) => Effect.Effect<string, EmailTemplateRenderError, never>;

type SendEffect = (
  payload: CreateEmailOptions,
  options?: CreateEmailRequestOptions
) => Effect.Effect<CreateEmailResponse, ResendError, never>;
type ResendServiceEffect = Effect.Effect<
  {
    readonly resend: Resend;
    readonly send: SendEffect;
    readonly renderEmail: RenderEmail;
  },
  never,
  never
>;

const serviceEffect: ResendServiceEffect = Effect.gen(function* () {
  const apiKey = yield* Config.redacted(Config.nonEmptyString("EMAIL_RESEND_API_KEY"));
  const resend = new Resend(Redacted.value(apiKey));

  const renderEmail: RenderEmail = Effect.fn("renderEmail")(
    function* (element: React.ReactElement) {
      return yield* Effect.tryPromise({
        try: () => render(element),
        catch: (error) =>
          new EmailTemplateRenderError({
            operation: "sendSignInOtpEmail",
            cause: error,
          }),
      });
    },
    Effect.tapErrorTag("EmailTemplateRenderError", Effect.logError)
  );
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
    renderEmail,
  };
}).pipe(Effect.catchTag("ConfigError", Effect.die));

export class ResendService extends Effect.Service<ResendService>()($I`ResendService`, {
  accessors: true,
  dependencies: [],
  effect: serviceEffect,
}) {
  static readonly layer: Layer.Layer<ResendService, never, never> = ResendService.Default;
}
