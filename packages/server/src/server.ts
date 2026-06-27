import { AppRpc } from "@app/domain/api/app-rpc";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Layer from "effect/Layer";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";
import * as RpcServer from "effect/unstable/rpc/RpcServer";
import { AuthMiddlewareLive } from "./api/auth-middleware-live.js";
import { ChatRpcLive } from "./api/chat/chat-rpc-live.js";
import { RpcLogger, RpcLoggerLive } from "./lib/rpc-logger.js";
import { TracerLive } from "./lib/tracer.js";

const RpcRouter = RpcServer.layerHttp({
  group: AppRpc.middleware(RpcLogger),
  path: "/rpc",
  protocol: "websocket",
});

const AllRoutes = Layer.mergeAll(RpcRouter).pipe(
  Layer.provide(
    Layer.mergeAll(
      ChatRpcLive,
      AuthMiddlewareLive,
      RpcLoggerLive,
    ),
  ),
  Layer.provide(RpcSerialization.layerJson),
  Layer.provide(
    HttpRouter.cors({
      allowedOrigins: ["*"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type"],
    }),
  ),
);

const ServerLayer = HttpRouter.serve(AllRoutes).pipe(
  Layer.provide(BunHttpServer.layer({ port: 3000 })),
  Layer.provide(TracerLive),
  Layer.orDie,
);

BunRuntime.runMain(Layer.launch(ServerLayer));
