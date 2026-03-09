import {
  RgbChannel as RgbChannelSchema,
  RgbInputChannel as RgbInputChannelSchema,
  RgbInput as RgbInputSchema,
  Rgb as RgbSchema,
} from "./Color.ts";

/**
 * Compatibility export for {@link Rgb}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Rgb = RgbSchema;

/**
 * Type for {@link Rgb}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Rgb = InstanceType<typeof Rgb>;

/**
 * Compatibility export for {@link RgbChannel}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RgbChannel = RgbChannelSchema;

/**
 * Type for {@link RgbChannel}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RgbChannel = typeof RgbChannel.Type;

/**
 * Compatibility export for {@link RgbInput}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RgbInput = RgbInputSchema;

/**
 * Type for {@link RgbInput}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RgbInput = InstanceType<typeof RgbInput>;

/**
 * Compatibility export for {@link RgbInputChannel}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const RgbInputChannel = RgbInputChannelSchema;

/**
 * Type for {@link RgbInputChannel}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RgbInputChannel = typeof RgbInputChannel.Type;
