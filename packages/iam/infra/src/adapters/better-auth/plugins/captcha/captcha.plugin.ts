import { serverEnv } from "@beep/shared-infra/ServerEnv";
import { captcha } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
export type CaptchaPluginEffect = Effect.Effect<ReturnType<typeof captcha>, never, never>;
export type CaptchaPlugin = Effect.Effect.Success<CaptchaPluginEffect>;
export const captchaPlugin: CaptchaPluginEffect = Effect.gen(function* () {
  return captcha({
    provider: "google-recaptcha" as const,
    secretKey: Redacted.value(serverEnv.cloud.google.captcha.secretKey),
  });
});
