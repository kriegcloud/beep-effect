import * as Effect from "effect/Effect";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { HttpApiClient } from "effect/unstable/httpapi";
import { AgentHttpApi } from "./AgentHttpApi.js";

/**
 * @since 0.0.0
 */
export type AgentHttpClientOptions = {
  readonly baseUrl?: string | URL;
  readonly transformClient?: (client: HttpClient.HttpClient) => HttpClient.HttpClient;
  readonly transformResponse?:
    | ((effect: Effect.Effect<unknown, unknown, unknown>) => Effect.Effect<unknown, unknown, unknown>)
    | undefined;
};

/**
 * @since 0.0.0
 */
export const makeHttpClient = (options?: AgentHttpClientOptions) => HttpApiClient.make(AgentHttpApi, options);

/**
 * @since 0.0.0
 */
export const makeHttpClientDefault = (options?: AgentHttpClientOptions) =>
  makeHttpClient(options).pipe(Effect.provide(FetchHttpClient.layer));
