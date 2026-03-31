/**
 * @module @beep/shared-providers/1password/Config
 * @since 0.0.0
 */
import { $SharedProvidersId } from "@beep/identity";
import { SemanticVersion, TaggedErrorClass } from "@beep/schema";
import { Config, Effect, Layer, ServiceMap } from "effect";
import * as S from "effect/Schema";

const $I = $SharedProvidersId.create("1password/Config");

/**
 * 1Password Configuration Error
 *
 * @category Configuration
 * @since 0.0.0
 */
export class OPConfigError extends TaggedErrorClass<OPConfigError>($I`OPConfigError`)(
  "OPConfigError",
  {
    cause: S.DefectWithStack,
  },
  $I.annote("OPConfigError", {
    description: "1Password Configuration Error",
  })
) {}

/**
 * 1password provider configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const OPConfig = Config.nested("OP")(
  Config.all({
    serviceAccountToken: Config.redacted("SERVICE_ACCOUNT_TOKEN"),
    accountName: Config.nonEmptyString("ACCOUNT_NAME"),
    integrationName: Config.nonEmptyString("INTEGRATION_NAME"),
    integrationVersion: Config.schema(SemanticVersion, "INTEGRATION_VERSION"),
  })
);

/**
 * 1Password Configuration Service Shape
 *
 * @category Configuration
 * @since 0.0.0
 */
export class OPServiceShape extends S.Class<OPServiceShape>($I`OPServiceShape`)(
  {
    serviceAccountToken: S.Redacted(S.NonEmptyString),
    accountName: S.NonEmptyString,
    integrationName: S.NonEmptyString,
    integrationVersion: SemanticVersion,
  },
  $I.annote("OPServiceShape", {
    description: "1Password Configuration Service Shape",
  })
) {}

/**
 * 1Password Configuration Service
 *
 * @category Configuration
 * @since 0.0.0
 */
export class OPConfigService extends ServiceMap.Service<OPConfigService, OPServiceShape>()($I`OPConfigService`) {}

/**
 * 1Password Configuration Service Effect
 *
 * @category Configuration
 * @since 0.0.0
 */
const serviceEffect = Effect.gen(function* () {
  const config = new OPServiceShape(yield* OPConfig);

  return OPConfigService.of(config);
}).pipe(Effect.mapError(OPConfigError.new({})));

/**
 * OPConfig Layer
 *
 *
 * @category Configuration
 * @since 0.0.0
 * @type {Layer.Layer<OPConfigService, OPConfigError, never>}
 */
export const layer: Layer.Layer<OPConfigService, OPConfigError> = Layer.effect(OPConfigService, serviceEffect);
