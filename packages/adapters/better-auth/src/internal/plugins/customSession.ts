import type {BetterAuthPlugin} from "better-auth";
import {customSession} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof customSession>[0]>

export const customSessionPlugin = (opts: Opts) => customSession(opts satisfies Opts) satisfies BetterAuthPlugin;