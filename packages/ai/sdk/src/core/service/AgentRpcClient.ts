import { Effect, Layer } from "effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { AgentRpcs } from "./AgentRpcs.js";

/**
 * @since 0.0.0
 */
export type AgentRpcClient = RpcClient.FromGroup<typeof AgentRpcs>;

/**
 * @since 0.0.0
 */
export type AgentRpcClientOptions = {
  readonly url: string;
  readonly transformClient?: <E, R>(client: HttpClient.HttpClient.With<E, R>) => HttpClient.HttpClient.With<E, R>;
};

/**
 * @since 0.0.0
 */
export const layer = (options: AgentRpcClientOptions) => {
  const protocolOptions = options.transformClient
    ? { url: options.url, transformClient: options.transformClient }
    : { url: options.url };

  return RpcClient.layerProtocolHttp(protocolOptions).pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(RpcSerialization.layerNdjson)
  );
};

/**
 * @since 0.0.0
 */
export const makeRpcClient = (options: AgentRpcClientOptions) =>
  RpcClient.make(AgentRpcs).pipe(Effect.provide(layer(options)));
