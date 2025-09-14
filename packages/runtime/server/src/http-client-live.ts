import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import type { HttpClient } from "@effect/platform/HttpClient";
import type * as Layer from "effect/Layer";

export type HttpClientLive = Layer.Layer<HttpClient, never, never>;
export const HttpClientLive: HttpClientLive = FetchHttpClient.layer;
