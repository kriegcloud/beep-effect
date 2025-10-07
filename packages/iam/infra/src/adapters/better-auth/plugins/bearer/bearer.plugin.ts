import { bearer } from "better-auth/plugins";
import * as Effect from "effect/Effect";
<<<<<<< HEAD
import type { BearerOptions } from "./plugin-options";

export type BearerPluginEffect = Effect.Effect<ReturnType<typeof bearer>, never, never>;
export type BearerPlugin = Effect.Effect.Success<BearerPluginEffect>;
export const bearerPlugin: BearerPluginEffect = Effect.succeed(bearer({} satisfies BearerOptions));
=======
export type BearerPluginEffect = Effect.Effect<ReturnType<typeof bearer>, never, never>;
export type BearerPlugin = Effect.Effect.Success<BearerPluginEffect>;
export const bearerPlugin: BearerPluginEffect = Effect.succeed(bearer());
>>>>>>> auth-type-perf
