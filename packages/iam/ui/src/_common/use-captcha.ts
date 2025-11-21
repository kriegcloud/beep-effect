"use client";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { useGoogleReCaptcha } from "@wojtekmaj/react-recaptcha-v3";
import * as Data from "effect/Data";

import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";

const DEFAULT_CAPTCHA_ENDPOINTS = [paths.auth.signUp, paths.auth.signIn, paths.auth.requestResetPassword] as const;

const sanitizeActionName = F.flow(
  (action: string): string => (Str.startsWith("/")(action) ? Str.substring(1)(action) : action),
  (action) =>
    action
      .replace(/-([a-z])/g, (_, letter) => Str.toUpperCase(letter))
      .replace(/\/([a-z])/g, (_, letter) => Str.toUpperCase(letter)),
  Str.replace(/\//g, ""),
  Str.replace(/[^A-Za-z0-9_]/g, "")
);

class CaptchaError extends Data.TaggedError("CaptchaError")<{
  readonly cause: unknown;
  readonly message: string;
  readonly action: string;
}> {}

export const useCaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const runtime = useRuntime();
  const runClientPromise = makeRunClientPromise(runtime);
  const executeCaptchaEffect = Effect.fn(function* (action: (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number]) {
    const sanitizedAction = sanitizeActionName(action);
    const responseOpt = yield* Effect.tryPromise({
      try: async () => await executeRecaptcha?.(sanitizedAction),
      catch: (e) =>
        new CaptchaError({
          cause: e,
          message: `Failed to execute captcha for action: ${sanitizedAction}`,
          action: sanitizedAction,
        }),
    }).pipe(Effect.map(O.fromNullable));

    if (O.isNone(responseOpt)) {
      return yield* new CaptchaError({
        cause: null,
        message: `Failed to execute captcha for action: ${sanitizedAction}`,
        action: sanitizedAction,
      });
    }
    return Redacted.make(responseOpt.value);
  });

  const executeCaptcha = async (action: (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number]) =>
    runClientPromise(executeCaptchaEffect(action));
  const getCaptchaHeadersEffect = Effect.fn(function* (action: (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number]) {
    if (DEFAULT_CAPTCHA_ENDPOINTS.includes(action)) {
      const redacted = yield* executeCaptchaEffect(action);
      return { "x-captcha-response": Redacted.value(redacted) };
    }
    return Effect.asVoid;
  });
  const getCaptchaHeaders = async (action: (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number]) =>
    runClientPromise(getCaptchaHeadersEffect(action));

  return {
    executeCaptcha,
    getCaptchaHeaders,
    executeCaptchaEffect,
    getCaptchaHeadersEffect,
  };
};
