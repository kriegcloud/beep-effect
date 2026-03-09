import {
  HexColorInput as HexColorInputSchema,
  HexColor as HexColorSchema,
  NormalizeHexColor as NormalizeHexColorSchema,
} from "./Color.ts";

/**
 * Compatibility export for {@link HexColor}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HexColor = HexColorSchema;

/**
 * Type for {@link HexColor}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HexColor = typeof HexColor.Type;

/**
 * Compatibility export for {@link HexColorInput}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const HexColorInput = HexColorInputSchema;

/**
 * Type for {@link HexColorInput}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HexColorInput = typeof HexColorInput.Type;

/**
 * Compatibility export for {@link NormalizeHexColor}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const NormalizeHexColor = NormalizeHexColorSchema;

/**
 * Type for {@link NormalizeHexColor}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NormalizeHexColor = typeof NormalizeHexColor.Type;
