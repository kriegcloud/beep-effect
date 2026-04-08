/**
 * Browser-safe shared observability configuration schema.
 *
 * @module @beep/observability/CoreConfig
 * @since 0.0.0
 */
import { $ObservabilityId } from "@beep/identity/packages";
import { LogLevel } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("CoreConfig");

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
 * const config = new ObservabilityCoreConfig({
 *   serviceName: "todox-web",
 *   serviceVersion: "0.1.0",
 *   environment: "development",
 *   minLogLevel: "Info",
 * })
 *
 * console.log(config.serviceName) // "todox-web"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class ObservabilityCoreConfig extends S.Class<ObservabilityCoreConfig>($I`ObservabilityCoreConfig`)(
  {
    serviceName: S.String,
    serviceVersion: S.String,
    environment: S.String,
    minLogLevel: LogLevel,
  },
  $I.annote("ObservabilityCoreConfig", {
    description: "Browser-safe shared observability configuration.",
  })
) {}
