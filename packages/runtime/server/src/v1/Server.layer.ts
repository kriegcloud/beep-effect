import { serverEnv } from "@beep/shared-server/ServerEnv";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpServer from "@effect/platform/HttpServer";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as Layer from "effect/Layer";
import * as EffectLogger from "effect/Logger";
import * as AuthContext from "./AuthContext.layer.ts";
import * as HttpRouter from "./HttpRouter.layer.ts";
import * as Persistence from "./Persistence.layer.ts";
import * as Tooling from "./Tooling.layer.ts";

/**
 * Complete server layer composition including:
 * - HTTP router with all routes and middleware
 * - Bun HTTP server runtime
 * - HTTP client and server context
 * - Authentication and authorization middleware
 * - Database and storage infrastructure
 * - Tracing and logging infrastructure
 * - Minimum log level configuration
 */
export const layer = HttpRouter.layer.pipe(
  Layer.provide(BunHttpServer.layer({ port: serverEnv.app.api.port })),
  Layer.provide([
    FetchHttpClient.layer,
    HttpServer.layerContext,
    EffectLogger.minimumLogLevel(serverEnv.app.logLevel),
    Persistence.layer,
    AuthContext.layer,
    Tooling.layer,
  ])
);
