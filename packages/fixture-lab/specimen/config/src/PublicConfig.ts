/**
 * Browser-safe configuration for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { Config } from "effect";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("config/PublicConfig");

/**
 * Public, non-secret configuration consumed by the specimen slice.
 *
 * @category models
 * @since 0.0.0
 */
export class SpecimenPublicConfig extends S.Class<SpecimenPublicConfig>($I`SpecimenPublicConfig`)(
  {
    labelPrefix: S.String,
  },
  $I.annote("SpecimenPublicConfig", {
    description: "Public, non-secret configuration consumed by the synthetic Specimen slice.",
  })
) {}

const rawSpecimenPublicConfig = Config.all({
  labelPrefix: Config.string("SPECIMEN_LABEL_PREFIX").pipe(Config.withDefault("Fixture")),
});

/**
 * Config provider for non-secret specimen settings.
 *
 * @example
 * ```ts
 * import { specimenPublicConfig } from "@beep/fixture-lab-specimen-config/public"
 *
 * const config = specimenPublicConfig
 * void config
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const specimenPublicConfig: Config.Config<SpecimenPublicConfig> = rawSpecimenPublicConfig.pipe(
  Config.map((input) => new SpecimenPublicConfig(input))
);
