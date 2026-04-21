import { $ObservabilityId } from "@beep/identity/packages";
import { LogLevel } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("web/Config");

/**
 * Browser-only observability configuration.
 *
 * @example
 * ```typescript
 * import { WebObservabilityConfig } from "@beep/observability/web"
 *
 * const config = new WebObservabilityConfig({
 * 
 * 
 * 
 * 
 * 
 * })
 *
 * console.log(config.serviceName) // "todox-web"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class WebObservabilityConfig extends S.Class<WebObservabilityConfig>($I`WebObservabilityConfig`)(
  {
    serviceName: S.String,
    serviceVersion: S.String,
    environment: S.String,
    minLogLevel: LogLevel,
    resourceAttributes: S.Record(S.String, S.String),
  },
  $I.annote("WebObservabilityConfig", {
    description: "Browser-only observability configuration.",
  })
) {}

/**
 * Convert browser config into an OpenTelemetry resource shape.
 *
 * @example
 * ```typescript
 * import { WebObservabilityConfig, toWebResource } from "@beep/observability/web"
 *
 * const config = new WebObservabilityConfig({
 * 
 * 
 * 
 * 
 * 
 * })
 *
 * const resource = toWebResource(config)
 * console.log(resource.serviceName) // "todox-web"
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const toWebResource = (config: WebObservabilityConfig) => ({
  serviceName: config.serviceName,
  serviceVersion: config.serviceVersion,
  attributes: {
    deployment_environment: config.environment,
    ...config.resourceAttributes,
  },
});
