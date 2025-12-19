import { DomainRpc } from "@beep/shared-domain";
import { EventStreamRpcLive } from "@beep/shared-server/api/public/event-stream/event-stream-rpc-live";
import { FilesRpcLive } from "@beep/shared-server/api/public/files/files-rpc-live";
import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";

export class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()("RpcLogger", {
  wrap: true,
  optional: true,
}) {}

export const RpcLoggerLive = Layer.succeed(
  RpcLogger,
  RpcLogger.of((opts) =>
    Effect.flatMap(Effect.exit(opts.next), (exit) =>
      Exit.match(exit, {
        onSuccess: F.constant(exit),
        onFailure: (cause) =>
          Effect.zipRight(
            Effect.annotateLogs(Effect.logError(`RPC request failed: ${opts.rpc._tag}`, cause), {
              "rpc.method": opts.rpc._tag,
              "rpc.clientId": opts.clientId,
            }),
            exit
          ),
      })
    )
  )
);

export const layer = RpcServer.layerHttpRouter({
  group: DomainRpc.middleware(RpcLogger),
  path: "/v1/documents/rpc",
  protocol: "websocket",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(Layer.mergeAll(EventStreamRpcLive, FilesRpcLive, RpcLoggerLive)),
  Layer.provide(RpcSerialization.layerNdjson)
);
