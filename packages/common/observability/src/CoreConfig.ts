import { $ObservabilityId } from "@beep/identity/packages";
import { LogLevel } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ObservabilityId.create("CoreConfig");

/**
 * Browser-safe shared observability configuration.
 *
 * @since 0.0.0
 * @category DomainModel
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
