/**
 * Secret configuration for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { Config } from "effect";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("config/Secrets");

const SpecimenSigningSecret = S.Redacted(S.String, { label: "SpecimenSigningSecret" }).pipe(
  S.annotate(
    $I.annote("SpecimenSigningSecret", {
      description: "Redacted signing secret consumed by the synthetic Specimen slice.",
    })
  )
);

/**
 * Secret configuration consumed by the specimen slice.
 *
 * @category models
 * @since 0.0.0
 */
export class SpecimenSecretConfig extends S.Class<SpecimenSecretConfig>($I`SpecimenSecretConfig`)(
  {
    signingSecret: SpecimenSigningSecret,
  },
  $I.annote("SpecimenSecretConfig", {
    description: "Secret configuration consumed by the synthetic Specimen slice.",
  })
) {}

const rawSpecimenSecretConfig = Config.all({
  signingSecret: Config.redacted("SPECIMEN_SIGNING_SECRET"),
});

/**
 * Config provider for secret specimen settings.
 *
 * @example
 * ```ts
 * import { specimenSecretConfig } from "@beep/fixture-lab-specimen-config/secrets"
 *
 * const config = specimenSecretConfig
 * void config
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const specimenSecretConfig: Config.Config<SpecimenSecretConfig> = rawSpecimenSecretConfig.pipe(
  Config.map((input) => new SpecimenSecretConfig(input))
);
