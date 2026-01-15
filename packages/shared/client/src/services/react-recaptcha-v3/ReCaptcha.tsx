"use client";
import { thunkNull } from "@beep/utils";
/**
 * ReCaptcha v3 component for automatic verification.
 * @module
 */
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { useEffect } from "react";
import { useReCaptchaState } from "./useReCaptchaAtom";

type ReCaptchaProps = {
  /**
   * The action name for the reCAPTCHA verification.
   */
  readonly action?: undefined | string;
  /**
   * Callback function to handle the token after verification.
   */
  readonly onVerify: (token: string) => void;
  /**
   * Callback function to handle errors during verification.
   */
  readonly onError?: undefined | ((error: unknown) => void);
  /**
   * A value to trigger reCAPTCHA verification again.
   */
  readonly refreshReCaptcha?: undefined | boolean | string | number | null;
};

/**
 * Initializes the reCAPTCHA verification process.
 *
 * This component automatically executes reCAPTCHA verification when mounted or when
 * refreshReCaptcha changes, and calls onVerify with the resulting token.
 */
export default function ReCaptcha({ action, onVerify, onError, refreshReCaptcha }: ReCaptchaProps) {
  const { container, executeRecaptcha, isReady } = useReCaptchaState();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    executeRecaptcha(action)
      .then((token) => {
        onVerify(token);
      })
      .catch((error: unknown) => {
        if (onError) {
          onError(error);
        }
      });
  }, [action, executeRecaptcha, isReady, refreshReCaptcha, onVerify, onError]);

  // Render container div if container is a string ID
  return O.match(container, {
    onNone: thunkNull,
    onSome: (c) => (P.isString(c) ? <div id={c} /> : null),
  });
}
