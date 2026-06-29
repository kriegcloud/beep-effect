/**
 * CLDR territory code and name schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Territories as TerritoriesData } from "@beep/data";
import { $SchemaId } from "@beep/identity";
import { Struct } from "@beep/utils";
import { LiteralKit } from "./LiteralKit/index.ts";
import { MappedLiteralKit } from "./MappedLiteralKit/index.ts";

const $I = $SchemaId.create("TerritoryCode");

/**
 * CLDR territory code schema derived from generated territory data.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TerritoryCode } from "@beep/schema/TerritoryCode"
 *
 * const code = S.decodeUnknownSync(TerritoryCode)("US")
 * console.log(code) // "US"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TerritoryCode = LiteralKit(Struct.keysNonEmpty(TerritoriesData.TerritoryDataByCode)).pipe(
  $I.annoteSchema("TerritoryCode", {
    description: "A CLDR territory code.",
  })
);

/**
 * {@inheritDoc TerritoryCode}
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TerritoryCode } from "@beep/schema/TerritoryCode"
 *
 * const code: TerritoryCode = S.decodeUnknownSync(TerritoryCode)("US")
 * console.log(code) // "US"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type TerritoryCode = typeof TerritoryCode.Type;

const territoryNameByCodeEntries = Struct.entriesNonEmpty(TerritoriesData.TerritoryDataNameByCode);

/**
 * CLDR territory display-name schema derived from generated territory data.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TerritoryName } from "@beep/schema/TerritoryCode"
 *
 * const name = S.decodeUnknownSync(TerritoryName)("United States")
 * console.log(name) // "United States"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TerritoryName = LiteralKit(
  Struct.keysNonEmpty(Struct.reverse(TerritoriesData.TerritoryDataNameByCode))
).pipe(
  $I.annoteSchema("TerritoryName", {
    description: "A CLDR English territory display name.",
  })
);

/**
 * {@inheritDoc TerritoryName}
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TerritoryName } from "@beep/schema/TerritoryCode"
 *
 * const name: TerritoryName = S.decodeUnknownSync(TerritoryName)("United States")
 * console.log(name) // "United States"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type TerritoryName = typeof TerritoryName.Type;

/**
 * Reversible CLDR territory code/name codec.
 *
 * Decoding maps territory code to display name; `TerritoryNameFromCode.To`
 * maps display name back to territory code.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TerritoryNameFromCode } from "@beep/schema/TerritoryCode"
 *
 * const name = S.decodeUnknownSync(TerritoryNameFromCode)("US")
 * console.log(name) // "United States"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TerritoryNameFromCode = MappedLiteralKit(territoryNameByCodeEntries).pipe(
  $I.annoteSchema("TerritoryNameFromCode", {
    description: "A reversible CLDR territory code to English display-name codec.",
  })
);

/**
 * Reverse codec from CLDR territory display name to territory code.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TerritoryCodeFromName } from "@beep/schema/TerritoryCode"
 *
 * const code = S.decodeUnknownSync(TerritoryCodeFromName)("United States")
 * console.log(code) // "US"
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const TerritoryCodeFromName = TerritoryNameFromCode.To;
