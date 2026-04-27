/**
 * Test configuration layer for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Layer, Redacted } from "effect";
import { SpecimenConfig } from "./Config.js";
import { SpecimenPublicConfig } from "./PublicConfig.js";
import { SpecimenSecretConfig } from "./Secrets.js";
import { SpecimenServerConfig } from "./ServerConfig.js";

/**
 * Public config fixture used by specimen tests.
 *
 * @category fixtures
 * @since 0.0.0
 */
export const specimenTestPublicConfig = new SpecimenPublicConfig({
  labelPrefix: "Fixture",
});

/**
 * Server config fixture used by specimen tests.
 *
 * @category fixtures
 * @since 0.0.0
 */
export const specimenTestServerConfig = new SpecimenServerConfig({
  initialSpecimenId: "specimen-1",
});

/**
 * Secret config fixture used by specimen tests.
 *
 * @category fixtures
 * @since 0.0.0
 */
export const specimenTestSecretConfig = new SpecimenSecretConfig({
  signingSecret: Redacted.make("fixture-secret", { label: "SpecimenSigningSecret" }),
});

/**
 * Static config layer for role-local fixture tests.
 *
 * @example
 * ```ts
 * import { SpecimenConfigTestLayer } from "@beep/fixture-lab-specimen-config/test"
 *
 * void SpecimenConfigTestLayer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const SpecimenConfigTestLayer = Layer.succeed(
  SpecimenConfig,
  SpecimenConfig.of({
    public: specimenTestPublicConfig,
    server: specimenTestServerConfig,
    secrets: specimenTestSecretConfig,
  })
);
