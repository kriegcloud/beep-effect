import * as WebSdk from "@effect/opentelemetry/WebSdk";
import type * as Layer from "effect/Layer";
import { toWebResource, type WebObservabilityConfig } from "./Config.ts";

/**
 * Thin browser-safe wrapper around `@effect/opentelemetry/WebSdk.layer`.
 *
 * @example
 * ```typescript
 * import { WebObservabilityConfig } from "@beep/observability/web"
 * import { layerWebSdk } from "@beep/observability/web"
 *
 * const config = new WebObservabilityConfig({
 *   serviceName: "todox-web",
 *   serviceVersion: "0.1.0",
 *   environment: "development",
 *   minLogLevel: "Info",
 *   resourceAttributes: {},
 * })
 *
 * const layer = layerWebSdk(config)
 * void layer
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const layerWebSdk = (
  config: WebObservabilityConfig
): Layer.Layer<import("@effect/opentelemetry/Resource").Resource> =>
  WebSdk.layer(() => ({
    resource: toWebResource(config),
  }));
