/**
 * Package-level server layer composer for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { SpecimenConfigLive } from "@beep/fixture-lab-specimen-config/layer";
import { Layer } from "effect";
import { SpecimenServerLayer } from "./entities/Specimen/Specimen.layer.js";

/**
 * Live in-memory server layer for the golden fixture.
 *
 * @example
 * ```ts
 * import { SpecimenServerLive } from "@beep/fixture-lab-specimen-server"
 *
 * void SpecimenServerLive
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const SpecimenServerLive = SpecimenServerLayer.pipe(Layer.provide(SpecimenConfigLive));
