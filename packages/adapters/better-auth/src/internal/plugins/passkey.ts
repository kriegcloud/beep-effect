import type {BetterAuthPlugin} from "better-auth";
import { passkey } from "better-auth/plugins/passkey";

type Opts = NonNullable<Parameters<typeof passkey>[0]>

export const makePasskeyPlugin = (opts: Opts) =>
  passkey(opts satisfies Opts) satisfies BetterAuthPlugin;