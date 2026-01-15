/**
 * Global type augmentations for Google ReCaptcha API.
 * @module
 */

/**
 * Google ReCaptcha API interface.
 */
type Grecaptcha = {
  readonly execute: (
    clientIdOrReCaptchaKey: number | string,
    options: { readonly action?: undefined | string }
  ) => Promise<string>;
  readonly getResponse: (action: string) => string;
  readonly ready: (cb: () => void) => void;
  readonly render: (container: string | HTMLElement, options: Record<string, unknown>) => number;
  readonly reset: (widgetId: number) => void;
};

/**
 * ReCaptcha configuration object structure.
 */
type GrecaptchaCfg = {
  readonly clients?: undefined | Record<string, Record<string, unknown>>;
  readonly fns?: undefined | Array<() => void>;
};

declare global {
  interface Window {
    grecaptcha?:
      | undefined
      | (Partial<Grecaptcha> & {
          enterprise?: undefined | Partial<Grecaptcha>;
          getPageId?: undefined | (() => string);
        });
    ___grecaptcha_cfg?: undefined | GrecaptchaCfg;
  }
}

export {};
