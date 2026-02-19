import { OpenAiEmbeddingLayerConfig } from "@beep/knowledge-server/Embedding/providers/OpenAiLayer";
import { CentralRateLimiterServiceLive } from "@beep/knowledge-server/LlmControl/RateLimiter";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpServer from "@effect/platform/HttpServer";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";
import * as EffectLogger from "effect/Logger";
import * as HttpRouter from "./HttpRouter.layer";
import * as Persistence from "./Persistence.layer";
import * as Tooling from "./Tooling.layer";

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
    // Ensure Effect Config reads env in the same constant-case shape as `serverEnv`.
    Layer.setConfigProvider(ConfigProvider.fromEnv().pipe(ConfigProvider.constantCase)),
    // Provide shared LLM control-plane + embeddings model at the server boundary so
    // downstream slices (knowledge embeddings/search) cannot leak context requirements.
    CentralRateLimiterServiceLive,
    OpenAiEmbeddingLayerConfig,
    Persistence.layer,
    Tooling.layer,
  ])
);
