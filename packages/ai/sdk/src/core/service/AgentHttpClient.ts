import { Effect } from "effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { HttpApiClient } from "effect/unstable/httpapi";
import { AgentHttpApi } from "./AgentHttpApi.js";

/**
 * @since 0.0.0
 * @category Integration
 */
export type AgentHttpClientOptions = {
  readonly authToken?: string;
  readonly baseUrl?: string | URL;
  readonly transformClient?: (client: HttpClient.HttpClient) => HttpClient.HttpClient;
  readonly transformResponse?:
    | ((effect: Effect.Effect<unknown, unknown, unknown>) => Effect.Effect<unknown, unknown, unknown>)
    | undefined;
};

const withAuthToken =
  (authToken?: string) =>
  (client: HttpClient.HttpClient): HttpClient.HttpClient =>
    authToken === undefined ? client : HttpClient.mapRequest(client, HttpClientRequest.bearerToken(authToken));

/**
 * @since 0.0.0
 * @category Integration
 */
export const makeHttpClient = (options?: AgentHttpClientOptions) =>
  HttpApiClient.make(AgentHttpApi, {
    ...options,
    transformClient: (client) => {
      const authedClient = withAuthToken(options?.authToken)(client);
      return options?.transformClient === undefined ? authedClient : options.transformClient(authedClient);
    },
  });

/**
 * @since 0.0.0
 * @category Integration
 */
export const makeHttpClientDefault = (options?: AgentHttpClientOptions) =>
  makeHttpClient(options).pipe(Effect.provide(FetchHttpClient.layer));
