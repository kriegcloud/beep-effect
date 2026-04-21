import { $ObservabilityId } from "@beep/identity/packages";
import { LogLevel } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("server/Config");

/**
 * Server-only observability configuration.
 *
 * @example
 * ```typescript
 * import { ServerObservabilityConfig } from "@beep/observability/server"
 *
 * const config = new ServerObservabilityConfig({
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * })
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class ServerObservabilityConfig extends S.Class<ServerObservabilityConfig>($I`ServerObservabilityConfig`)(
  {
    serviceName: S.String,
    serviceVersion: S.String,
    environment: S.String,
    minLogLevel: LogLevel,
    otlpBaseUrl: S.String,
    otlpEnabled: S.Boolean,
    otlpResourceAttributes: S.Record(S.String, S.String),
    devtoolsEnabled: S.Boolean,
    devtoolsUrl: S.String,
    prometheusPrefix: S.String,
  },
  $I.annote("ServerObservabilityConfig", {
    description: "Server-only observability configuration.",
  })
) {}

/**
 * Convert server config into OTLP resource attributes.
 *
 * @example
 * ```typescript
 * import { ServerObservabilityConfig, toOtlpResource } from "@beep/observability/server"
 *
 * declare const config: ServerObservabilityConfig
 * const resource = toOtlpResource(config)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const toOtlpResource = (config: ServerObservabilityConfig) => ({
  serviceName: config.serviceName,
  serviceVersion: config.serviceVersion,
  attributes: {
    deployment_environment: config.environment,
    ...config.otlpResourceAttributes,
  },
});
