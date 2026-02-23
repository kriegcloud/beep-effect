/**
 * Global type augmentations for Google ReCaptcha API.
 * @module
 */

/**
 * Google ReCaptcha API interface.
 */
type Grecaptcha = {
  execute: (clientIdOrReCaptchaKey: number | string, options: { action?: undefined | string }) => Promise<string>;
  getResponse: (action: string) => string;
  ready: (cb: () => void) => void;
  render: (container: string | HTMLElement, options: Record<string, unknown>) => number;
  reset: (widgetId: number) => void;
};

/**
 * ReCaptcha configuration object structure.
 */
type GrecaptchaCfg = {
  clients?: undefined | Record<string, Record<string, unknown>>;
  fns?: undefined | Array<() => void>;
};

declare global {
  interface Window {
    [key: string]: any;
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
