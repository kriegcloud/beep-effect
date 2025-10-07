import { bearer } from "better-auth/plugins";
import * as Effect from "effect/Effect";
export type BearerPluginEffect = Effect.Effect<ReturnType<typeof bearer>, never, never>;
export type BearerPlugin = Effect.Effect.Success<BearerPluginEffect>;
export const bearerPlugin: BearerPluginEffect = Effect.succeed(bearer());
