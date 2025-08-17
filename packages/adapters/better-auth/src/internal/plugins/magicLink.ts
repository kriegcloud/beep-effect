import type {BetterAuthPlugin} from "better-auth";
import { magicLink } from "better-auth/plugins";

type Opts = NonNullable<Parameters<typeof magicLink>[0]>

export const makeMagicLinkPlugin = (opts: Opts) =>
  magicLink(opts satisfies Opts) satisfies BetterAuthPlugin;