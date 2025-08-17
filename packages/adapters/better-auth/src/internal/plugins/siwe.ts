import type {BetterAuthPlugin} from "better-auth";
import { siwe } from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof siwe>[0]>

export const makeSiwePlugin = (opts: Opts) =>
  siwe(opts satisfies Opts) satisfies BetterAuthPlugin;