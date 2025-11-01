import type * as Redacted from "effect/Redacted";
import type { CaptchaProvider } from "./captcha-provider";
export type CaptchaOptions = {
  /**
   * Captcha site key
   */
  readonly siteKey: Redacted.Redacted<string>;
  /**
   * Captcha provider type
   */
  readonly provider: CaptchaProvider.Type;
  /**
   * Hide the captcha badge
   * @default false
   */
  readonly hideBadge?: undefined | boolean;
  /**
   * Use recaptcha.net domain instead of google.com
   * @default false
   */
  readonly recaptchaNet?: undefined | boolean;
  /**
   * Enable enterprise mode for Google reCAPTCHA
   * @default false
   */
  readonly enterprise?: undefined | boolean;
  /**
   * Overrides the default array of paths where captcha validation is enforced
   * @default ["/sign-up/email", "/sign-in/email", "/forget-password"]
   */
  readonly endpoints?: undefined | ReadonlyArray<string>;
};
