import type { BetterAuthPlugin } from "better-auth";
import { passkey } from "better-auth/plugins/passkey";

export type PasskeyOptions = NonNullable<Parameters<typeof passkey>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makePasskeyPlugin = (opts: PasskeyOptions) =>
  passkey(opts satisfies PasskeyOptions) satisfies BetterAuthPlugin;
