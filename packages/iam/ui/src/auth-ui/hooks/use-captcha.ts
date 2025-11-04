import type HCaptcha from "@hcaptcha/react-hcaptcha";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useGoogleReCaptcha } from "@wojtekmaj/react-recaptcha-v3";
import * as F from "effect/Function";
import * as Str from "effect/String";
import type { RefObject } from "react";
import { useContext, useRef } from "react";
import type ReCAPTCHA from "react-google-recaptcha";
import type { AuthLocalization } from "../lib/auth-localization";
import { AuthUIContext } from "../lib/auth-ui-provider";

// Default captcha endpoints
const DEFAULT_CAPTCHA_ENDPOINTS = ["/sign-up/email", "/sign-in/email", "/forget-password"];

// Sanitize action name for reCAPTCHA
// Google reCAPTCHA only allows A-Za-z/_ in action names
const sanitizeActionName = (action: string): string => {
  // First remove leading slash if present
  let result = F.pipe(action, Str.startsWith("/"), (hasForwardSlash) =>
    hasForwardSlash ? Str.substring(1)(action) : action
  );

  result = result
    .replace(/-([a-z])/g, (_, letter) => Str.toUpperCase(letter))
    .replace(/\/([a-z])/g, (_, letter) => Str.toUpperCase(letter))
    .replace(/\//g, "")
    .replace(/[^A-Za-z0-9_]/g, "");
  // Convert both kebab-case and path separators to camelCase
  // Example: "/sign-in/email" becomes "signInEmail"

  return result;
};

export function useCaptcha({ localization }: { localization: Partial<AuthLocalization> }) {
  const { captcha, localization: contextLocalization } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  // biome-ignore lint/suspicious/noExplicitAny: ignore
  const captchaRef = useRef<any>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const executeCaptcha = async (action: string) => {
    if (!captcha) throw new Error(localization.MISSING_RESPONSE);

    // Sanitize the action name for reCAPTCHA
    let response: string | undefined | null;

    switch (captcha.provider) {
      case "google-recaptcha-v3": {
        const sanitizedAction = sanitizeActionName(action);
        response = await executeRecaptcha?.(sanitizedAction);
        break;
      }
      case "google-recaptcha-v2-checkbox": {
        const recaptchaRef = captchaRef as RefObject<ReCAPTCHA>;
        response = recaptchaRef.current.getValue();
        break;
      }
      case "google-recaptcha-v2-invisible": {
        const recaptchaRef = captchaRef as RefObject<ReCAPTCHA>;
        response = await recaptchaRef.current.executeAsync();
        break;
      }
      case "cloudflare-turnstile": {
        const turnstileRef = captchaRef as RefObject<TurnstileInstance>;
        response = turnstileRef.current.getResponse();
        break;
      }
      case "hcaptcha": {
        const hcaptchaRef = captchaRef as RefObject<HCaptcha>;
        response = hcaptchaRef.current.getResponse();
        break;
      }
    }

    if (!response) {
      throw new Error(localization.MISSING_RESPONSE);
    }

    return response;
  };

  const getCaptchaHeaders = async (action: string) => {
    if (!captcha) return undefined;

    // Use custom endpoints if provided, otherwise use defaults
    const endpoints = captcha.endpoints || DEFAULT_CAPTCHA_ENDPOINTS;

    // Only execute captcha if the action is in the endpoints list
    if (endpoints.includes(action)) {
      return { "x-captcha-response": await executeCaptcha(action) };
    }

    return undefined;
  };

  const resetCaptcha = () => {
    if (!captcha) return;

    switch (captcha.provider) {
      case "google-recaptcha-v3": {
        // No widget to reset; token is generated per execute call
        break;
      }
      case "google-recaptcha-v2-checkbox":
      case "google-recaptcha-v2-invisible": {
        const recaptchaRef = captchaRef as RefObject<ReCAPTCHA>;
        recaptchaRef.current?.reset?.();
        break;
      }
      case "cloudflare-turnstile": {
        const turnstileRef = captchaRef as RefObject<TurnstileInstance>;
        // Some versions expose reset on the instance
        // biome-ignore lint/suspicious/noExplicitAny: defensive
        (turnstileRef.current as any)?.reset?.();
        break;
      }
      case "hcaptcha": {
        const hcaptchaRef = captchaRef as RefObject<HCaptcha>;
        // HCaptcha uses resetCaptcha()
        hcaptchaRef.current?.resetCaptcha?.();
        break;
      }
    }
  };

  return {
    captchaRef,
    getCaptchaHeaders,
    resetCaptcha,
  };
}
