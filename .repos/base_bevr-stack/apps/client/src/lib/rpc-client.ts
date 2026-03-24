import { EventRpc } from "@repo/domain/Rpc";
import { Effect, Layer, ServiceMap } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import {
  RpcClient as EffectRpcClient,
  RpcSerialization,
} from "effect/unstable/rpc";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:9000";

const ProtocolLive = EffectRpcClient.layerProtocolHttp({
  url: `${SERVER_URL}/rpc`,
}).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(RpcSerialization.layerNdjson),
);

export class RpcClient extends ServiceMap.Service<RpcClient>()("RpcClient", {
  make: Effect.gen(function* () {
    return {
      client: yield* EffectRpcClient.make(EventRpc),
    } as const;
  }),
}) {
  static layer = Layer.effect(RpcClient)(RpcClient.make).pipe(
    Layer.provide(ProtocolLive),
  );
}
