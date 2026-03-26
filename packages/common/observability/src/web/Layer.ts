import * as WebSdk from "@effect/opentelemetry/WebSdk";
import type * as Layer from "effect/Layer";
import { toWebResource, type WebObservabilityConfig } from "./Config.ts";

/**
 * Thin browser-safe wrapper around `@effect/opentelemetry/WebSdk.layer`.
 *
 * @since 0.0.0
 * @category Layers
 */
export const layerWebSdk = (
  config: WebObservabilityConfig
): Layer.Layer<import("@effect/opentelemetry/Resource").Resource> =>
  WebSdk.layer(() => ({
    resource: toWebResource(config),
  }));
