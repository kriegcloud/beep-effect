import { openAPI } from "better-auth/plugins";
import * as Effect from "effect/Effect";
import type { OpenAPIOptions } from "./plugin-options";

export type OpenApiPluginEffect = Effect.Effect<ReturnType<typeof openAPI>, never, never>;
export type OpenApiPlugin = Effect.Effect.Success<OpenApiPluginEffect>;
export const openApiPlugin: OpenApiPluginEffect = Effect.succeed(openAPI({} satisfies OpenAPIOptions));
