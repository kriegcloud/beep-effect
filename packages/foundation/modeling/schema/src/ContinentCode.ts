/**
 * CLDR continent code and name schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Territories as TerritoriesData } from "@beep/data";
import { $SchemaId } from "@beep/identity";
import { Struct } from "@beep/utils";
import { LiteralKit } from "./LiteralKit/index.ts";
import { MappedLiteralKit } from "./MappedLiteralKit/index.ts";

const $I = $SchemaId.create("ContinentCode");

/**
 * CLDR top-level territory containment code schema.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ContinentCode = LiteralKit(Struct.keysNonEmpty(TerritoriesData.ContinentDataByCode)).pipe(
  $I.annoteSchema("ContinentCode", {
    description: "A CLDR top-level territory containment code.",
  })
);

/**
 * {@inheritDoc ContinentCode}
 *
 * @since 0.0.0
 * @category models
 */
export type ContinentCode = typeof ContinentCode.Type;

const continentNameByCodeEntries = Struct.entriesNonEmpty(TerritoriesData.ContinentDataNameByCode);

/**
 * CLDR top-level territory containment display-name schema.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ContinentName = LiteralKit(
  Struct.keysNonEmpty(Struct.reverse(TerritoriesData.ContinentDataNameByCode))
).pipe(
  $I.annoteSchema("ContinentName", {
    description: "A CLDR top-level territory containment display name.",
  })
);

/**
 * {@inheritDoc ContinentName}
 *
 * @since 0.0.0
 * @category models
 */
export type ContinentName = typeof ContinentName.Type;

/**
 * Reversible CLDR continent code/name codec.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ContinentNameFromCode = MappedLiteralKit(continentNameByCodeEntries).pipe(
  $I.annoteSchema("ContinentNameFromCode", {
    description: "A reversible CLDR continent code to English display-name codec.",
  })
);

/**
 * Reverse codec from CLDR continent display name to CLDR code.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ContinentCodeFromName = ContinentNameFromCode.To;
