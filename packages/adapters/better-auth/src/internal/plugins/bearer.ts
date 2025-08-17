import type { BetterAuthPlugin } from "better-auth";
import { bearer } from "better-auth/plugins";

export type BearerOptions = NonNullable<Parameters<typeof bearer>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeBearerPlugin = (opts: BearerOptions) =>
  bearer({
    /**
     * If true, only signed tokens
     * will be converted to session
     * cookies
     *
     * @default false
     */
    requireSignature: opts.requireSignature ?? true,
  } satisfies BearerOptions) satisfies BetterAuthPlugin;
