import { FetchHttpClient } from "@effect/platform"
import type * as HttpClient from "@effect/platform/HttpClient"
import { RpcClient, RpcSerialization } from "@effect/rpc"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { AgentRpcs } from "./AgentRpcs.js"

export type AgentRpcClient = RpcClient.FromGroup<typeof AgentRpcs>

export type AgentRpcClientOptions = {
  readonly url: string
  readonly transformClient?: <E, R>(
    client: HttpClient.HttpClient.With<E, R>
  ) => HttpClient.HttpClient.With<E, R>
}

export const layer = (options: AgentRpcClientOptions) => {
  const protocolOptions = options.transformClient
    ? { url: options.url, transformClient: options.transformClient }
    : { url: options.url }

  return RpcClient.layerProtocolHttp(protocolOptions).pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(RpcSerialization.layerNdjson)
  )
}

export const makeRpcClient = (options: AgentRpcClientOptions) =>
  RpcClient.make(AgentRpcs).pipe(Effect.provide(layer(options)))
