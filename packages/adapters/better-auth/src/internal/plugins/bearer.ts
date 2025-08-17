import type {BetterAuthPlugin} from "better-auth";
import {bearer} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof bearer>[0]>

export const makeBearerPlugin = (opts: Opts) => bearer({
  	/**
	 * If true, only signed tokens
	 * will be converted to session
	 * cookies
	 *
	 * @default false
	 */
	requireSignature: opts.requireSignature ?? true
} satisfies Opts) satisfies BetterAuthPlugin;