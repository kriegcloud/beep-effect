import { scim } from "@better-auth/scim";
import * as Effect from "effect/Effect";

export type SCIMPluginEffect = Effect.Effect<ReturnType<typeof scim>, never, never>;
export type SCIMPlugin = Effect.Effect.Success<SCIMPluginEffect>;
export const scimPlugin: SCIMPluginEffect = Effect.succeed(scim());
