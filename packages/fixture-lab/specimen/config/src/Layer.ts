/**
 * Runtime config resolution layer for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Effect, Layer } from "effect";
import { SpecimenConfig } from "./Config.js";
import { specimenPublicConfig } from "./PublicConfig.js";
import { specimenSecretConfig } from "./Secrets.js";
import { specimenServerConfig } from "./ServerConfig.js";

/**
 * Resolved specimen config service shape.
 *
 * @category services
 * @since 0.0.0
 */
export type { SpecimenConfigShape } from "./Config.js";

/**
 * Context service key for resolved specimen configuration.
 *
 * @category services
 * @since 0.0.0
 */
export { SpecimenConfig };

/**
 * Effect that resolves the specimen configuration from the active ConfigProvider.
 *
 * @category configuration
 * @since 0.0.0
 */
export const loadSpecimenConfig = Effect.gen(function* () {
  const publicConfig = yield* specimenPublicConfig;
  const server = yield* specimenServerConfig;
  const secrets = yield* specimenSecretConfig;

  return {
    public: publicConfig,
    server,
    secrets,
  };
}).pipe(Effect.withSpan("SpecimenConfig.load"));

/**
 * Live layer for resolved specimen configuration.
 *
 * @example
 * ```ts
 * import { SpecimenConfigLive } from "@beep/fixture-lab-specimen-config/layer"
 *
 * void SpecimenConfigLive
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const SpecimenConfigLive = Layer.effect(SpecimenConfig, loadSpecimenConfig);
