import type { BetterAuthPlugin } from "better-auth";
import { emailOTP } from "better-auth/plugins";

export type EmailOtpOptions = NonNullable<Parameters<typeof emailOTP>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeEmailOtpPlugin = (opts: EmailOtpOptions) =>
  emailOTP(opts satisfies EmailOtpOptions) satisfies BetterAuthPlugin;
