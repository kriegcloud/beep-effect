/**
 * Cardinal direction literal schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "../LiteralKit/index.ts";

const $I = $SchemaId.create("person/CardinalDirection");

/**
 * Cardinal direction literal schema.
 *
 * @example
 * ```ts
 * import { CardinalDirection } from "@beep/schema/CardinalDirection"
 *
 * console.log(CardinalDirection.Options.includes("north"))
 * ```
 *
 * CardinalDirection - The cardinal directions
 *
 * @since 0.0.0
 * @category validation
 */
export const CardinalDirection = LiteralKit(["north", "south", "east", "west"]).pipe(
  $I.annoteSchema("CardinalDirection", {
    description: "CardinalDirection - The cardinal directions",
  })
);
/**
 * {@inheritDoc CardinalDirection}
 *
 * @category validation
 * @since 0.0.0
 */
export type CardinalDirection = typeof CardinalDirection.Type;

/**
 * CardinalDirectionAbbrev - The abbreviated version of the {@link CardinalDirection}
 *
 * @example
 * ```ts
 * import { CardinalDirectionAbbrev } from "@beep/schema/CardinalDirection"
 *
 * console.log(CardinalDirectionAbbrev.Options.includes("N"))
 * ```
 *
 * @category validation
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
 * @category validation
 * @since 0.0.0
 */
export type CardinalDirectionAbbrev = typeof CardinalDirectionAbbrev.Type;

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { CardinalDirection as Schema, CardinalDirectionAbbrev as Abbrev };
