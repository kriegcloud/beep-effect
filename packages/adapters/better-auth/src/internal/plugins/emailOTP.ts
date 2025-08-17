import type {BetterAuthPlugin} from "better-auth";
import { emailOTP } from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof emailOTP>[0]>

export const makeEmailOtpPlugin = (opts: Opts) =>
  emailOTP(opts satisfies Opts) satisfies BetterAuthPlugin;