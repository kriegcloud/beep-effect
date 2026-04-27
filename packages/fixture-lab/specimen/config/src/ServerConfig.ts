/**
 * Server-only configuration for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { Config } from "effect";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("config/ServerConfig");

/**
 * Server-only settings used to initialize the in-memory specimen repository.
 *
 * @category models
 * @since 0.0.0
 */
export class SpecimenServerConfig extends S.Class<SpecimenServerConfig>($I`SpecimenServerConfig`)(
  {
    initialSpecimenId: S.String,
  },
  $I.annote("SpecimenServerConfig", {
    description: "Server-only settings used to initialize the synthetic Specimen repository.",
  })
) {}

const rawSpecimenServerConfig = Config.all({
  initialSpecimenId: Config.string("SPECIMEN_INITIAL_ID").pipe(Config.withDefault("specimen-1")),
});

/**
 * Config provider for server-only specimen settings.
 *
 * @example
 * ```ts
 * import { specimenServerConfig } from "@beep/fixture-lab-specimen-config/server"
 *
 * const config = specimenServerConfig
 * void config
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const specimenServerConfig: Config.Config<SpecimenServerConfig> = rawSpecimenServerConfig.pipe(
  Config.map((input) => new SpecimenServerConfig(input))
);
