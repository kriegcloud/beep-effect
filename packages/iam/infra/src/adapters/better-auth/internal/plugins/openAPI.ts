import type { BetterAuthPlugin } from "better-auth";
import { openAPI } from "better-auth/plugins";

export type OpenApiOptions = NonNullable<Parameters<typeof openAPI>[0]>;

/**
 * TODO factor out
 * @param opts
 */
export const makeOpenApiPlugin = (opts: OpenApiOptions) =>
  openAPI(opts satisfies OpenApiOptions) satisfies BetterAuthPlugin;
