import { BunHttpServer } from "@effect/platform-bun";
import { Layer } from "effect";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { layer as AgentRpcHandlers } from "./AgentRpcHandlers.js";
import { AgentRpcs } from "./AgentRpcs.js";

/**
 * @since 0.0.0
 */
export type AgentRpcServerOptions = {
  readonly port?: number;
  readonly path?: string;
};

/**
 * @since 0.0.0
 */
export const layer = (options: AgentRpcServerOptions = {}) => {
  const port = options.port ?? 3000;
  const path = (options.path ?? "/rpc") as HttpRouter.PathInput;

  const rpcLayer = RpcServer.layer(AgentRpcs).pipe(Layer.provide(AgentRpcHandlers));

  const protocolLayer = RpcServer.layerProtocolHttp({ path }).pipe(Layer.provide(RpcSerialization.layerNdjson));

  return HttpRouter.serve(
    Layer.empty.pipe(
      Layer.provide(rpcLayer),
      Layer.provide(protocolLayer),
      Layer.provide(BunHttpServer.layer({ port }))
    )
  );
};
