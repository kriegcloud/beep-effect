import { HttpApiClient } from "effect/unstable/httpapi"
import type * as HttpClient from "effect/unstable/http/HttpClient"
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient"
import * as Effect from "effect/Effect"
import { AgentHttpApi } from "./AgentHttpApi.js"

export type AgentHttpClientOptions = {
  readonly baseUrl?: string | URL
  readonly transformClient?: (client: HttpClient.HttpClient) => HttpClient.HttpClient
  readonly transformResponse?:
    | ((
      effect: Effect.Effect<unknown, unknown, unknown>
    ) => Effect.Effect<unknown, unknown, unknown>)
    | undefined
}

export const makeHttpClient = (options?: AgentHttpClientOptions) =>
  HttpApiClient.make(AgentHttpApi, options)

export const makeHttpClientDefault = (options?: AgentHttpClientOptions) =>
  makeHttpClient(options).pipe(Effect.provide(FetchHttpClient.layer))
