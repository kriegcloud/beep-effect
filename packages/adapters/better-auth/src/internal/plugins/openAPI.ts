import type {BetterAuthPlugin} from "better-auth";
import {openAPI} from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof openAPI>[0]>

export const makeOpenApiPlugin = (opts: Opts) =>
  openAPI(opts satisfies Opts) satisfies BetterAuthPlugin;