import { $IamClientId } from "@beep/identity/packages";
import { ReCaptcha } from "@beep/shared-client";
import { clientEnv } from "@beep/shared-env";
import * as W from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

const $I = $IamClientId.create("_common/captcha-middleware");

export class CaptchaMiddleware extends W.WrapperMiddleware.Tag()($I`CaptchaMiddleware`, {
  failure: ReCaptcha.ReCaptchaErrorSchema,
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
  return yield* captchaService.execute(Redacted.value(clientEnv.captchaSiteKey), "auth");
});
