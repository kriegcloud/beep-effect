import * as OtlpTracer from "@effect/opentelemetry/OtlpTracer";
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServerError from "@effect/platform/HttpServerError";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import { DomainRpc } from "@example/domain/domain-api";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as LogLevel from "effect/LogLevel";
import * as Logger from "effect/Logger";
import { createServer } from "node:http";
import { CurrentUserRpcMiddlewareLive } from "./public/auth/auth-middleware-live.js";
import { EventStreamRpcLive } from "./public/event-stream/event-stream-rpc-live.js";
import { FilesRpcLive } from "./public/files/files-rpc-live.js";

const TracerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const otlpUrl = yield* Config.string("OTLP_URL").pipe(
      Config.withDefault("http://localhost:4318/v1/traces"),
    );
    return OtlpTracer.layer({
      url: otlpUrl,
      resource: {
        serviceName: "effect-files-example-api",
      },
      exportInterval: "1 second",
      maxBatchSize: 100,
    });
  }),
).pipe(Layer.provide(FetchHttpClient.layer));

const LoggingLevelLive = Logger.minimumLogLevel(LogLevel.Debug);

const httpLogger = HttpMiddleware.make((httpApp) => {
  let counter = 0;
  return Effect.withFiberRuntime((fiber) => {
    const request = Context.unsafeGet(fiber.currentContext, HttpServerRequest.HttpServerRequest);
    return Effect.withLogSpan(
      Effect.flatMap(Effect.exit(httpApp), (exit) => {
        if (fiber.getFiberRef(HttpMiddleware.loggerDisabled)) {
          return exit;
        }

        if (exit._tag === "Failure") {
          const [response, cause] = HttpServerError.causeResponseStripped(exit.cause);
          if (response.status === 404) {
            return exit;
          }
          return Effect.zipRight(
            Effect.annotateLogs(
              Effect.log(cause._tag === "Some" ? cause.value : "Sent HTTP Response"),
              {
                "http.method": request.method,
                "http.url": request.url,
                "http.status": response.status,
              },
            ),
            exit,
          );
        }
        return Effect.zipRight(
          Effect.annotateLogs(Effect.log("Sent HTTP response"), {
            "http.method": request.method,
            "http.url": request.url,
            "http.status": exit.value.status,
          }),
          exit,
        );
      }),
      `http.span.${++counter}`,
    );
  });
});

const HealthRouter = HttpLayerRouter.use((router) =>
  router.add("GET", "/health", HttpServerResponse.text("OK")),
);

class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()("RpcLogger", {
  wrap: true,
  optional: true,
}) {}

const RpcLoggerLive = Layer.succeed(
  RpcLogger,
  RpcLogger.of((opts) =>
    Effect.flatMap(Effect.exit(opts.next), (exit) =>
      Exit.match(exit, {
        onSuccess: () => exit,
        onFailure: (cause) =>
          Effect.zipRight(
            Effect.annotateLogs(Effect.logError(`RPC request failed: ${opts.rpc._tag}`, cause), {
              "rpc.method": opts.rpc._tag,
              "rpc.clientId": opts.clientId,
            }),
            exit,
          ),
      }),
    ),
  ),
);

const RpcRouter = RpcServer.layerHttpRouter({
  group: DomainRpc.middleware(RpcLogger),
  path: "/rpc",
  protocol: "websocket",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(Layer.mergeAll(EventStreamRpcLive, FilesRpcLive, RpcLoggerLive)),
  Layer.provide(CurrentUserRpcMiddlewareLive),
  Layer.provide(RpcSerialization.layerNdjson),
);

const AllRoutes = Layer.mergeAll(HealthRouter, RpcRouter).pipe(
  Layer.provide(
    HttpLayerRouter.cors({
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization", "B3", "traceparent"],
      credentials: true,
    }),
  ),
);

HttpLayerRouter.serve(AllRoutes, {
  middleware: httpLogger,
  disableLogger: false,
  disableListenLog: false,
}).pipe(
  HttpMiddleware.withTracerDisabledWhen(
    (request) =>
      request.method === "OPTIONS" || request.url === "/health" || request.url === "/rpc",
  ),
  HttpMiddleware.withSpanNameGenerator((request: HttpServerRequest.HttpServerRequest) => {
    let path = request.url;
    try {
      const host = request.headers.host ?? "localhost:3001";
      const base = `http://${host}`;
      const parsedUrl = new URL(request.url, base);
      path = parsedUrl.pathname;
    } catch {
      path = "[unparseable_url_path]";
    }
    return `http ${request.method} ${path}`;
  }),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3001 })),
  Layer.provide(TracerLive),
  Layer.provide(LoggingLevelLive),
  Layer.launch,
  NodeRuntime.runMain,
);
