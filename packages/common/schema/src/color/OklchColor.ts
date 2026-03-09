import {
  OklchChroma as OklchChromaSchema,
  OklchColor as OklchColorSchema,
  OklchCoordinate as OklchCoordinateSchema,
  OklchHue as OklchHueSchema,
  OklchInput as OklchInputSchema,
  OklchLightness as OklchLightnessSchema,
} from "./Color.ts";

/**
 * Compatibility export for {@link OklchChroma}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchChroma = OklchChromaSchema;

/**
 * Type for {@link OklchChroma}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchChroma = typeof OklchChroma.Type;

/**
 * Compatibility export for {@link OklchColor}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchColor = OklchColorSchema;

/**
 * Type for {@link OklchColor}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchColor = InstanceType<typeof OklchColor>;

/**
 * Compatibility export for {@link OklchCoordinate}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchCoordinate = OklchCoordinateSchema;

/**
 * Type for {@link OklchCoordinate}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchCoordinate = typeof OklchCoordinate.Type;

/**
 * Compatibility export for {@link OklchHue}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchHue = OklchHueSchema;

/**
 * Type for {@link OklchHue}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchHue = typeof OklchHue.Type;

/**
 * Compatibility export for {@link OklchInput}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchInput = OklchInputSchema;

/**
 * Type for {@link OklchInput}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchInput = InstanceType<typeof OklchInput>;

/**
 * Compatibility export for {@link OklchLightness}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const OklchLightness = OklchLightnessSchema;

/**
 * Type for {@link OklchLightness}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OklchLightness = typeof OklchLightness.Type;
