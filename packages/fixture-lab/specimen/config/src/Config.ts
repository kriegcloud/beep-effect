/**
 * Resolved configuration service for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { Context } from "effect";
import type { SpecimenPublicConfig } from "./PublicConfig.js";
import type { SpecimenSecretConfig } from "./Secrets.js";
import type { SpecimenServerConfig } from "./ServerConfig.js";

const $I = $FixtureLabSpecimenId.create("config/Config");

/**
 * Resolved configuration values consumed by runtime layers.
 *
 * @category services
 * @since 0.0.0
 */
export interface SpecimenConfigShape {
  readonly public: SpecimenPublicConfig;
  readonly secrets: SpecimenSecretConfig;
  readonly server: SpecimenServerConfig;
}

/**
 * Context service key for resolved specimen configuration.
 *
 * @example
 * ```ts
 * import { SpecimenConfig } from "@beep/fixture-lab-specimen-config/layer"
 *
 * void SpecimenConfig
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class SpecimenConfig extends Context.Service<SpecimenConfig, SpecimenConfigShape>()($I`SpecimenConfig`) {}
