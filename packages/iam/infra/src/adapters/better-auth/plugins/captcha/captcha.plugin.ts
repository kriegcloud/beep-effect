import { IamConfig } from "@beep/iam-infra/config";
import { captcha } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

export type CaptchaPluginEffect = Effect.Effect<ReturnType<typeof captcha>, never, IamConfig>;
export type CaptchaPlugin = Effect.Effect.Success<CaptchaPluginEffect>;
export const captchaPlugin: CaptchaPluginEffect = Effect.gen(function* () {
  const config = yield* IamConfig;
  return captcha({
    provider: "google-recaptcha" as const,
    secretKey: Redacted.value(config.cloud.google.captcha.secretKey),
  });
});
