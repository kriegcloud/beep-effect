import { anonymous } from "better-auth/plugins/anonymous";
import * as Effect from "effect/Effect";

export type AnonymousPluginEffect = Effect.Effect<ReturnType<typeof anonymous>, never, never>;
export type AnonymousPlugin = Effect.Effect.Success<AnonymousPluginEffect>;
export const anonymousPlugin: AnonymousPluginEffect = Effect.succeed(anonymous());
