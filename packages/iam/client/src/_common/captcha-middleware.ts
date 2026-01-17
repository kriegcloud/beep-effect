import { $IamClientId } from "@beep/identity/packages";
import { ReCaptcha } from "@beep/shared-client";
import { clientEnv } from "@beep/shared-env";
import * as W from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

const $I = $IamClientId.create("tmp/_common/captcha-middleware");

export class CaptchaFailedError extends S.TaggedError<CaptchaFailedError>($I`CaptchaFailedError`)(
  "CaptchaFailed",
  {
    cause: S.optional(S.Defect),
    message: S.optionalWith(S.String, {
      default: () => "Failed to get captcha token.",
    }),
  },
  $I.annotations("CaptchaFailedError", {
    description: "An error that occured from failing to get a captcha response token.",
  })
) {
  static readonly new = (cause?: undefined | S.Schema.Type<typeof S.Defect>, message?: undefined | string) => {
    return new CaptchaFailedError({
      cause,
      message,
    });
  };
}

export class CaptchaMiddleware extends W.WrapperMiddleware.Tag()($I`CaptchaMiddleware`, {
  failure: S.Union(
    ReCaptcha.ReCaptchaNotFoundError,
    ReCaptcha.ReCaptchaNotReadyError,
    ReCaptcha.ReCaptchaClientNotMountedError,
    ReCaptcha.ReCaptchaExecutionError
  ),
  provides: ReCaptcha.ReCaptchaService,
}) {
  static readonly provide = () =>
    Layer.succeed(
      CaptchaMiddleware,
      CaptchaMiddleware.of(() => ReCaptcha.makeLive)
    );
}

export const withCaptchaResponse = Effect.gen(function* () {
  const captchaService = yield* ReCaptcha.ReCaptchaService;
  return yield* captchaService.execute(Redacted.value(clientEnv.captchaSiteKey), "/auth/sign-up");
});
