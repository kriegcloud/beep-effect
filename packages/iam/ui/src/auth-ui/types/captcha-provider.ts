import { BS } from "@beep/schema";

export const CaptchaProviderKit = BS.stringLiteralKit(
  "cloudflare-turnstile",
  "google-recaptcha-v2-checkbox",
  "google-recaptcha-v2-invisible",
  "google-recaptcha-v3",
  "hcaptcha",
  {
    enumMapping: [
      ["cloudflare-turnstile", "CLOUDFLARE_TURNSTILE"],
      ["google-recaptcha-v2-checkbox", "GOOGLE_RECAPTCHA_V2_CHECKBOX"],
      ["google-recaptcha-v2-invisible", "GOOGLE_RECAPTCHA_V2_INVISIBLE"],
      ["google-recaptcha-v3", "GOOGLE_RECAPTCHA_V3"],
      ["hcaptcha", "HCAPTCHA"],
    ],
  }
);

export class CaptchaProvider extends CaptchaProviderKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-ui/types/captcha-provider"),
  identifier: "CaptchaProvider",
  title: "Captcha Provider",
  description: "A captcha provider",
}) {
  static readonly Enum = CaptchaProviderKit.Enum;
  static readonly Options = CaptchaProviderKit.Options;
}

export declare namespace CaptchaProvider {
  export type Type = typeof CaptchaProvider.Type;
  export type Encoded = typeof CaptchaProvider.Encoded;
}
