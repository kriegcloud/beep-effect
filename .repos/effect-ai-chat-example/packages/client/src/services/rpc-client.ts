import { AppRpc } from "@app/domain/api/app-rpc";
import * as BrowserSocket from "@effect/platform-browser/BrowserSocket";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as RpcClient from "effect/unstable/rpc/RpcClient";
import type * as RpcClientError from "effect/unstable/rpc/RpcClientError";
import type * as RpcGroup from "effect/unstable/rpc/RpcGroup";
import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";

export class DomainRpcClient extends Context.Service<
  DomainRpcClient,
  RpcClient.RpcClient<RpcGroup.Rpcs<typeof AppRpc>, RpcClientError.RpcClientError>
>()("DomainRpcClient") {
  static layer = Layer.effect(DomainRpcClient)(
    RpcClient.make(AppRpc),
  ).pipe(
    Layer.provide(
      RpcClient.layerProtocolSocket({ retryTransientErrors: true }).pipe(
        Layer.provide([
          BrowserSocket.layerWebSocket("ws://localhost:3000/rpc"),
          RpcSerialization.layerJson,
        ]),
      ),
    ),
  );
}
