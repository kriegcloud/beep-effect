import { sso } from "@better-auth/sso";
import * as Effect from "effect/Effect";

export type SSOPluginEffect = Effect.Effect<ReturnType<typeof sso>, never, never>;
export type SSOPlugin = Effect.Effect.Success<SSOPluginEffect>;
export const ssoPlugin: SSOPluginEffect = Effect.succeed(sso({}));
