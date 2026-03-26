import { $ObservabilityId } from "@beep/identity/packages";
import { LogLevel } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("web/Config");

/**
 * Browser-only observability configuration.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category Observability
 */
export const toWebResource = (config: WebObservabilityConfig) => ({
  serviceName: config.serviceName,
  serviceVersion: config.serviceVersion,
  attributes: {
    deployment_environment: config.environment,
    ...config.resourceAttributes,
  },
});
