import { CorsLive } from "@beep/runtime-server/Cors";
import { HealthRouter } from "@beep/runtime-server/HealthRouter";
import { httpLogger, LoggingLive, RpcLogger, RpcLoggerLive } from "@beep/runtime-server/Logging";
import { TracingLive } from "@beep/runtime-server/Tracing";
import { DomainRpc } from "@beep/shared-domain";
import { EventStreamRpcLive } from "@beep/shared-infra/api/public/event-stream/event-stream-rpc-live";
import { FilesRpcLive } from "@beep/shared-infra/api/public/files/files-rpc-live";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import type * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Layer from "effect/Layer";
import { DevToolsLive } from "../DevTools.ts";
import { AuthContextRpcMiddlewareLive } from "./AuthContextMiddlewareLive.ts";

const RpcRouter = RpcServer.layerHttpRouter({
  group: DomainRpc.middleware(RpcLogger),
  path: "/v1/rpc",
  protocol: "websocket",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(Layer.mergeAll(EventStreamRpcLive, FilesRpcLive, RpcLoggerLive)),
  Layer.provide(AuthContextRpcMiddlewareLive),
  Layer.provide(RpcSerialization.layerNdjson)
);

const AllRoutes = Layer.mergeAll(HealthRouter, RpcRouter).pipe(Layer.provide(CorsLive));

export const httpApp = () =>
  HttpLayerRouter.serve(AllRoutes, {
    middleware: httpLogger,
    disableLogger: false,
    disableListenLog: false,
  }).pipe(
    HttpMiddleware.withTracerDisabledWhen(
      (request) => request.method === "OPTIONS" || request.url === "/health" || request.url === "/rpc"
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
    Layer.provide(BunHttpServer.layer({ port: 8080 })),
    Layer.provide(TracingLive),
    Layer.provide(LoggingLive),
    Layer.provide(DevToolsLive)
  );
