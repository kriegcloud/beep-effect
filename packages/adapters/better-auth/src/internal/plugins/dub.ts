import { dubAnalytics } from "@dub/better-auth"
import type {BetterAuthPlugin} from "better-auth";

type Opts = NonNullable<Parameters<typeof dubAnalytics>[0]>

export const makeDubPlugin = (opts: Opts) =>
  dubAnalytics(opts satisfies Opts) satisfies BetterAuthPlugin;