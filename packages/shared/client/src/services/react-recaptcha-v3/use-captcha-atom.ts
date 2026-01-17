"use client";
/**
 * Captcha hook using @effect-atom/atom-react.
 *
 * This replaces the context-based useCaptcha with an atom-based approach
 * that uses our internal @beep/shared-client/services/react-recaptcha-v3 implementation.
 * @module
 */
import { atomPromise, executeReCaptchaAtom, isReadyAtom } from "@beep/shared-client/services/react-recaptcha-v3";
import { paths } from "@beep/shared-domain";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";
import { useCallback } from "react";

const DEFAULT_CAPTCHA_ENDPOINTS = [paths.auth.signUp, paths.auth.signIn, paths.auth.requestResetPassword] as const;

const sanitizeActionName = F.flow(
  (action: string): string => (Str.startsWith("/")(action) ? Str.substring(1)(action) : action),
  (action) =>
    action
      .replace(/-([a-z])/g, (_, letter) => Str.toUpperCase(letter))
      .replace(/\/([a-z])/g, (_, letter) => Str.toUpperCase(letter)),
  Str.replace(/\//g, Str.empty),
  Str.replace(/[^A-Za-z0-9_]/g, Str.empty)
);

class CaptchaError extends Data.TaggedError("CaptchaError")<{
  readonly cause: unknown;
  readonly message: string;
  readonly action: string;
}> {}

/**
 * Hook for executing captcha using effect-atom.
 *
 * This uses the atom-based reCAPTCHA implementation from @beep/shared-client.
 *
 * @example
 * ```tsx
 * import { useCaptchaAtom } from "@beep/iam-ui/_common";
 *
 * function MyForm() {
 *   const { executeCaptcha, isReady } = useCaptchaAtom();
 *
 *   const handleSubmit = async () => {
 *     const token = await executeCaptcha(paths.auth.signIn);
 *     // Use token for verification
 *   };
 *
 *   return <button disabled={!isReady}>Submit</button>;
 * }
 * ```
 */
export const useCaptchaAtom = () => {
  const isReady = useAtomValue(isReadyAtom);
  const executeRecaptchaFn = useAtomSet(executeReCaptchaAtom, atomPromise);

  const executeCaptchaEffect = Effect.fn(function* (action: (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number]) {
    const sanitizedAction = sanitizeActionName(action);

    // Let executeReCaptchaAtom handle the ready-state check internally
    // This avoids closure issues where isReady might be stale
    const response = yield* Effect.tryPromise({
      try: async () => executeRecaptchaFn(sanitizedAction),
      catch: (e) =>
        new CaptchaError({
          cause: e,
          message: `Failed to execute captcha for action: ${sanitizedAction}`,
          action: sanitizedAction,
        }),
    });

    return Redacted.make(response);
  });

  const executeCaptcha = useCallback(
    async (action: (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number]) => {
      // Check if reCAPTCHA is ready before attempting execution
      // This prevents hanging on grecaptcha.ready() if the script hasn't loaded
      if (!isReady) {
        throw new CaptchaError({
          cause: new Error("reCAPTCHA not initialized"),
          message: "reCAPTCHA is not ready. Please wait for the page to fully load and try again.",
          action: sanitizeActionName(action),
        });
      }
      const response = await executeRecaptchaFn(action);
      return Redacted.make(response);
    },
    [isReady, executeRecaptchaFn]
  );

  const getCaptchaHeadersEffect = Effect.fn(function* (action: (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number]) {
    if (DEFAULT_CAPTCHA_ENDPOINTS.includes(action)) {
      const redacted = yield* executeCaptchaEffect(action);
      return { "x-captcha-response": Redacted.value(redacted) };
    }
    return Effect.asVoid;
  });

  const getCaptchaHeaders = useCallback(
    async (action: (typeof DEFAULT_CAPTCHA_ENDPOINTS)[number]) => getCaptchaHeadersEffect(action),
    [getCaptchaHeadersEffect]
  );

  return {
    executeCaptcha,
    getCaptchaHeaders,
    executeCaptchaEffect,
    getCaptchaHeadersEffect,
    isReady,
  };
};
