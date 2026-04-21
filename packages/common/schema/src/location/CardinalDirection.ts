/**
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "../LiteralKit.ts";

const $I = $SchemaId.create("person/CardinalDirection");

/**
 * CardinalDirection - The cardinal directions
 *
 * @since 0.0.0
 * @category Validation
 */
export const CardinalDirection = LiteralKit(["north", "south", "east", "west"]).pipe(
  $I.annoteSchema("CardinalDirection", {
    description: "CardinalDirection - The cardinal directions",
  })
);
/**
 * {@inheritDoc CardinalDirection}
 *
 * @category Validation
 * @since 0.0.0
 */
export type CardinalDirection = typeof CardinalDirection.Type;

/**
 * CardinalDirectionAbbrev - The abbreviated version of the {@link CardinalDirection}
 *
 * @category Validation
 * @since 0.0.0
 */
export const CardinalDirectionAbbrev = LiteralKit(["N", "S", "E", "W"]).pipe(
  $I.annoteSchema("CardinalDirectionAbbrev", {
    description: "CardinalDirectionAbbrev - The abbreviated version of the CardinalDirection",
  })
);

/**
 * {@inheritDoc CardinalDirectionAbbrev}
 *
 * @category Validation
 * @since 0.0.0
 */
export type CardinalDirectionAbbrev = typeof CardinalDirectionAbbrev.Type;
