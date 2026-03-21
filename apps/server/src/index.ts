import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { ChatServiceLive, FastModelLive, SampleToolkitLive } from "@repo/ai";
import { Api } from "@repo/domain/Api";
import { EventRpc } from "@repo/domain/Rpc";
import { WebSocketRpc } from "@repo/domain/WebSocket";
import { ObservabilityLive } from "@repo/observability";
import { PresenceServiceLive } from "@repo/presence";
import { Config, Effect, Layer } from "effect";
import { DevTools } from "effect/unstable/devtools";
import { HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { HealthGroupLive } from "./Api/Health";
import { HelloGroupLive } from "./Api/Hello";
import { EventRpcLive } from "./Rpc/Event";
import { PresenceRpcLive } from "./Rpc/Presence";

// ============================================================================
// Server Configuration
// ============================================================================

const ServerConfig = Config.all({
  port: Config.number("PORT").pipe(Config.withDefault(9000)),
  hostname: Config.string("HOST").pipe(Config.withDefault("0.0.0.0")),
  idleTimeout: Config.number("IDLE_TIMEOUT").pipe(Config.withDefault(120)), // seconds (Bun default is 10)
  allowedOrigins: Config.string("ALLOWED_ORIGINS").pipe(
    Config.withDefault("http://localhost:3000"),
  ),
  enableDevTools: Config.boolean("DEVTOOLS").pipe(Config.withDefault(false)),
});

// ============================================================================
// Router Composition
// ============================================================================

// HTTP API Router
const ApiRouter = HttpApiBuilder.layer(Api).pipe(
  Layer.provide([HealthGroupLive, HelloGroupLive]),
);

// HTTP RPC Router (for EventRpc - streaming over HTTP)
const HttpRpcRouter = RpcServer.layerHttp({
  group: EventRpc,
  path: "/rpc",
  protocol: "http", // Use HTTP for EventRpc
  spanPrefix: "rpc",
}).pipe(
  Layer.provide(EventRpcLive),
  Layer.provide(ChatServiceLive),
  Layer.provide(SampleToolkitLive),
  Layer.provide(FastModelLive),
  Layer.provide(RpcSerialization.layerNdjson),
);

// WebSocket RPC Router (for PresenceRpc - real-time presence)
const WebSocketRpcRouter = RpcServer.layerHttp({
  group: WebSocketRpc,
  path: "/ws",
  protocol: "websocket", // Use WebSocket for PresenceRpc!
  spanPrefix: "ws",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(PresenceRpcLive),
  Layer.provide(PresenceServiceLive),
  Layer.provide(RpcSerialization.layerNdjson),
);

// ============================================================================
// Server Launch
// ============================================================================

const DevToolsLive = Effect.gen(function* () {
  const config = yield* ServerConfig;
  if (!config.enableDevTools) {
    return Layer.empty;
  }
  yield* Effect.log("Enabling DevTools Layer");
  return DevTools.layer();
}).pipe(Layer.unwrap);

const HttpLive = Effect.gen(function* () {
  const config = yield* ServerConfig;
  const allowedOrigins = config.allowedOrigins.split(",").map((o) => o.trim());

  yield* Effect.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
  yield* Effect.log("Starting server with:");
  yield* Effect.log("  - HTTP API at /");
  yield* Effect.log("  - HTTP RPC at /rpc (EventRpc)");
  yield* Effect.log("  - WebSocket RPC at /ws (PresenceRpc)");

  const AllRouters = Layer.mergeAll(
    ApiRouter,
    HttpRpcRouter,
    WebSocketRpcRouter,
  ).pipe(
    Layer.provide(
      HttpRouter.cors({
        allowedOrigins,
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "B3", "traceparent"],
        credentials: true,
      }),
    ),
  );

  return HttpRouter.serve(AllRouters).pipe(
    HttpServer.withLogAddress,
    Layer.provideMerge(DevToolsLive),
    Layer.provideMerge(ObservabilityLive),
    Layer.provideMerge(BunHttpServer.layerConfig(ServerConfig)),
  );
}).pipe(Layer.unwrap, Layer.launch);

BunRuntime.runMain(HttpLive);
