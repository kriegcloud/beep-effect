import { $RuntimeServerId } from "@beep/identity/packages";
import { SharedRpcs } from "@beep/shared-domain";
import { SharedServerRpcs } from "@beep/shared-server/rpc";
import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import * as RpcSerialization from "@effect/rpc/RpcSerialization";
import * as RpcServer from "@effect/rpc/RpcServer";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import { AuthContextRpcMiddlewaresLayer } from "./AuthContext.layer";

const $I = $RuntimeServerId.create("Rpc.layer");

export class RpcLogger extends RpcMiddleware.Tag<RpcLogger>()($I`RpcLogger`, {
  wrap: true,
  optional: true,
}) {}

export const RpcLoggerLive: Layer.Layer<RpcLogger, never, never> = Layer.succeed(
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
  group: SharedRpcs.V1.Rpcs.middleware(RpcLogger),
  path: "/v1/shared/rpc",
  protocol: "websocket",
  spanPrefix: "rpc",
  disableFatalDefects: true,
}).pipe(
  Layer.provide(RpcLoggerLive),
  Layer.provide(RpcSerialization.layerNdjson),
  // Provide RPC handler implementations
  Layer.provide(SharedServerRpcs.layer),
  // Provide AuthContext middleware implementation
  Layer.provide(AuthContextRpcMiddlewaresLayer)
);
// const rpcLayer = RpcServer.layerHttpRouter({
//   group: SharedRpcs.V1.Rpcs,
//   path: "/v1/shared/rpc",
//   protocol: "websocket",
//   spanPrefix: "rpc",
//   disableFatalDefects: true,
// }).pipe(Layer.provide(Layer.mergeAll(SharedServerRpcs.layer)), Layer.provide(AuthContextLive.layer));
//
// const rpcsLayer = Layer.mergeAll(rpcLayer).pipe(Layer.provide(AuthContextLive.layer));
//
// export const layer = RpcServer.layerHttpRouter({
//   group: SharedRpcs.V1.Rpcs.middleware(RpcLogger),
//   path: "/v1/documents/rpc",
//   protocol: "websocket",
//   spanPrefix: "rpc",
//   disableFatalDefects: true,
// }).pipe(Layer.provideMerge(rpcsLayer), Layer.provide(RpcLoggerLive), Layer.provide(RpcSerialization.layerNdjson));
