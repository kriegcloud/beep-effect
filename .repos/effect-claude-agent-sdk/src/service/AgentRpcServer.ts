import * as HttpRouter from "@effect/platform/HttpRouter"
import { BunHttpServer } from "@effect/platform-bun"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import * as Layer from "effect/Layer"
import { AgentRpcs } from "./AgentRpcs.js"
import { layer as AgentRpcHandlers } from "./AgentRpcHandlers.js"

export type AgentRpcServerOptions = {
  readonly port?: number
  readonly path?: string
}

export const layer = (options: AgentRpcServerOptions = {}) => {
  const port = options.port ?? 3000
  const path = (options.path ?? "/rpc") as HttpRouter.PathInput

  const rpcLayer = RpcServer.layer(AgentRpcs).pipe(
    Layer.provide(AgentRpcHandlers)
  )

  const protocolLayer = RpcServer.layerProtocolHttp({ path }).pipe(
    Layer.provide(RpcSerialization.layerNdjson)
  )

  return HttpRouter.Default.serve().pipe(
    Layer.provide(rpcLayer),
    Layer.provide(protocolLayer),
    Layer.provide(BunHttpServer.layer({ port }))
  )
}
