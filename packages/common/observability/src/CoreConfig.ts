/**
 * Browser-safe shared observability configuration schema.
 *
 * @module @beep/observability/CoreConfig
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
 * @since 0.0.0
 * @category DomainModel
 */
export type ObservabilityCoreConfig = typeof ObservabilityCoreConfig.Type;
