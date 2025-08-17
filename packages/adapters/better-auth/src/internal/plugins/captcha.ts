import type {BetterAuthPlugin} from "better-auth";
import { captcha } from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof captcha>[0]>

export const makeCaptchaPlugin = (opts: Opts) =>
  captcha(opts satisfies Opts) satisfies BetterAuthPlugin;