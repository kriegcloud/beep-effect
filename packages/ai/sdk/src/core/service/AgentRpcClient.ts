import { Effect, Layer } from "effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";
import { AgentRpcs } from "./AgentRpcs.js";

/**
 * @since 0.0.0
 * @category Integration
 */
export type AgentRpcClient = RpcClient.FromGroup<typeof AgentRpcs>;

/**
 * @since 0.0.0
 * @category Integration
 */
export type AgentRpcClientOptions = {
  readonly authToken?: string;
  readonly url: string;
  readonly transformClient?: <E, R>(client: HttpClient.HttpClient.With<E, R>) => HttpClient.HttpClient.With<E, R>;
};

const withAuthToken =
  (authToken?: string) =>
  <E, R>(client: HttpClient.HttpClient.With<E, R>): HttpClient.HttpClient.With<E, R> =>
    authToken === undefined ? client : HttpClient.mapRequest(client, HttpClientRequest.bearerToken(authToken));

/**
 * @since 0.0.0
 * @category Integration
 */
export const layer = (options: AgentRpcClientOptions) => {
  const transformClient = <E, R>(client: HttpClient.HttpClient.With<E, R>): HttpClient.HttpClient.With<E, R> => {
    const authedClient = withAuthToken(options.authToken)(client);
    return options.transformClient === undefined ? authedClient : options.transformClient(authedClient);
  };
  const protocolOptions = { url: options.url, transformClient };

  return RpcClient.layerProtocolHttp(protocolOptions).pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(RpcSerialization.layerNdjson)
  );
};

/**
 * @since 0.0.0
 * @category Integration
 */
export const makeRpcClient = (options: AgentRpcClientOptions) =>
  RpcClient.make(AgentRpcs).pipe(Effect.provide(layer(options)));
