import type { BetterAuthPlugin } from "better-auth";
import { phoneNumber } from "better-auth/plugins";

export type PhoneNumberOptions = NonNullable<Parameters<typeof phoneNumber>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makePhoneNumberPlugin = (opts: PhoneNumberOptions) =>
  phoneNumber(opts satisfies PhoneNumberOptions) satisfies BetterAuthPlugin;
