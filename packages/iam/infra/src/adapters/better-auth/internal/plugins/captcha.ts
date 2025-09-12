import type { BetterAuthPlugin } from "better-auth";
import { captcha } from "better-auth/plugins";

export type CaptchaOptions = NonNullable<Parameters<typeof captcha>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeCaptchaPlugin = (opts: CaptchaOptions) =>
  captcha(opts satisfies CaptchaOptions) satisfies BetterAuthPlugin;
