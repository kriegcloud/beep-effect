import type {BetterAuthPlugin} from "better-auth";
import { phoneNumber } from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof phoneNumber>[0]>

export const makePhoneNumberPlugin = (opts: Opts) =>
  phoneNumber(opts satisfies Opts) satisfies BetterAuthPlugin;