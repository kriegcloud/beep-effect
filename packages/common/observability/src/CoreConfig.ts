/**
 * Browser-safe shared observability configuration schema.
 *
 * @module
 * @since 0.0.0
 */
import { $ObservabilityId } from "@beep/identity/packages";
import { LogLevel } from "@beep/schema";
import { pipe, Tuple } from "effect";
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
export const ObservabilityCoreConfig = LogLevel.mapMembers((members) => {
  const make = <TLogLevel extends LogLevel>(literal: S.Literal<TLogLevel>) =>
    S.Struct({
      serviceName: S.String,
      serviceVersion: S.String,
      environment: S.String,
      minLogLevel: S.tag(literal.literal),
    });

  return pipe(members, Tuple.evolve([make, make, make, make, make, make, make, make]));
}).pipe(
  S.toTaggedUnion("minLogLevel"),
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
