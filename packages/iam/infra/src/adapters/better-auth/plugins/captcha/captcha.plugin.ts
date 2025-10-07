import { serverEnv } from "@beep/core-env/server";
import { captcha } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
<<<<<<< HEAD
import type { CaptchaOptions } from "./plugin-options";
=======
>>>>>>> auth-type-perf

export type CaptchaPluginEffect = Effect.Effect<ReturnType<typeof captcha>, never, never>;
export type CaptchaPlugin = Effect.Effect.Success<CaptchaPluginEffect>;
export const captchaPlugin: CaptchaPluginEffect = Effect.succeed(
  captcha({
    provider: "google-recaptcha" as const,
    secretKey: Redacted.value(serverEnv.cloud.google.captcha.secretKey),
<<<<<<< HEAD
  } satisfies CaptchaOptions)
=======
  })
>>>>>>> auth-type-perf
);
