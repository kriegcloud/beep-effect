import { serverEnv } from "@beep/shared-server/ServerEnv";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpServer from "@effect/platform/HttpServer";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as Layer from "effect/Layer";
import * as EffectLogger from "effect/Logger";
import * as HttpRouter from "./HttpRouter.layer.ts";
import * as Persistence from "./Persistence.layer.ts";
import * as Tooling from "./Tooling.layer.ts";

/**
 * Complete server layer composition including:
 * - HTTP router with all routes, middleware, and authentication
 * - Bun HTTP server runtime
 * - HTTP client and server context
 * - Database and storage infrastructure
 * - Tracing and logging infrastructure
 *
 * Note: Authentication (AuthContext.layer) is composed inside HttpRouter.layer
 * to ensure Request<"Error", unknown> is handled by HttpLayerRouter.serve.
 */
export const layer = HttpRouter.layer.pipe(
  Layer.provide(BunHttpServer.layer({ port: serverEnv.app.api.port })),
  Layer.provide([
    FetchHttpClient.layer,
    HttpServer.layerContext,
    EffectLogger.minimumLogLevel(serverEnv.app.logLevel),
    Persistence.layer,
    Tooling.layer,
  ])
);
