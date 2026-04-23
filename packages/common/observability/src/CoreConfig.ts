/**
 * Browser-safe shared observability configuration schema.
 *
 * @module
 * @since 0.0.0
 */
import { $ObservabilityId } from "@beep/identity/packages";
import { LogLevel } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("CoreConfig");

const ObservabilityCoreConfigFields = {
  serviceName: S.String,
  serviceVersion: S.String,
  environment: S.String,
};

/**
 * Browser-safe shared observability configuration.
 *
 * Carries service identity, environment, and minimum log level for both
 * client and server observability wiring.
 *
 * @example
 * ```typescript
 * import { ObservabilityCoreConfig } from "@beep/observability"
 *
 * const config: ObservabilityCoreConfig = {
 *
 *
 *
 *
 * }
 *
 * console.log(config.serviceName) // "todox-web"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const ObservabilityCoreConfig = LogLevel.toTaggedUnion("minLogLevel")({
  All: ObservabilityCoreConfigFields,
  Fatal: ObservabilityCoreConfigFields,
  Error: ObservabilityCoreConfigFields,
  Warn: ObservabilityCoreConfigFields,
  Info: ObservabilityCoreConfigFields,
  Debug: ObservabilityCoreConfigFields,
  Trace: ObservabilityCoreConfigFields,
  None: ObservabilityCoreConfigFields,
}).pipe(
  $I.annoteSchema("ObservabilityCoreConfig", {
    description: "Browser-safe shared observability configuration.",
  })
);

/**
 * Type of {@link ObservabilityCoreConfig}
 *
 * @example
 * ```typescript
 * import type { ObservabilityCoreConfig } from "@beep/observability"
 *
 * const serviceName = (config: ObservabilityCoreConfig) => config.serviceName
 * void serviceName
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ObservabilityCoreConfig = typeof ObservabilityCoreConfig.Type;
