/**
 * TypeScript type definitions for ReCaptcha v3.
 * @module
 */

/**
 * ReCaptcha instance interface from the Google ReCaptcha API.
 */
export type ReCaptchaInstance = {
  readonly execute?:
    | undefined
    | ((clientIdOrReCaptchaKey: number | string, options: { readonly action?: undefined | string }) => Promise<string>);
  readonly render?: undefined | ((container: string | HTMLElement, options: Record<string, unknown>) => number);
  readonly ready?: undefined | ((cb: () => void) => void);
};
