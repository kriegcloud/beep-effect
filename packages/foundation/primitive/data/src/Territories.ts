/**
 * Unicode CLDR territory and continent data.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as internal from "./generated/cldr-territories.ts";

/**
 * A single generated CLDR territory entry.
 *
 * @example
 * ```typescript
 * import { TerritoryDataByCode, type TerritoryData } from "@beep/data/Territories"
 *
 * const unitedStates: TerritoryData = TerritoryDataByCode.US
 * console.assert(unitedStates.name === "United States")
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type TerritoryData = (typeof internal.TerritoryDataValues)[number];

/**
 * Union of generated CLDR territory code strings.
 *
 * @example
 * ```typescript
 * import type { TerritoryCode } from "@beep/data/Territories"
 *
 * const code: TerritoryCode = "US"
 * console.assert(code === "US")
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type TerritoryCode = TerritoryData["code"];

/**
 * Union of generated CLDR territory display names.
 *
 * @example
 * ```typescript
 * import type { TerritoryName } from "@beep/data/Territories"
 *
 * const name: TerritoryName = "United States"
 * console.assert(name === "United States")
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type TerritoryName = TerritoryData["name"];

/**
 * A single generated CLDR continent entry.
 *
 * @example
 * ```typescript
 * import { ContinentDataByCode, type ContinentData } from "@beep/data/Territories"
 *
 * const americas: ContinentData = ContinentDataByCode["019"]
 * console.assert(americas.name === "Americas")
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ContinentData = (typeof internal.ContinentDataValues)[number];

/**
 * Union of generated CLDR continent code strings.
 *
 * @example
 * ```typescript
 * import type { ContinentCode } from "@beep/data/Territories"
 *
 * const code: ContinentCode = "019"
 * console.assert(code === "019")
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ContinentCode = ContinentData["code"];

/**
 * Union of generated CLDR continent display names.
 *
 * @example
 * ```typescript
 * import type { ContinentName } from "@beep/data/Territories"
 *
 * const name: ContinentName = "Americas"
 * console.assert(name === "Americas")
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type ContinentName = ContinentData["name"];

/**
 * Stable source metadata for the generated CLDR territory dataset.
 *
 * @example
 * ```typescript
 * import { TerritoryDataMetadata } from "@beep/data/Territories"
 *
 * console.assert(TerritoryDataMetadata.releaseTag === "48.2.0")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const TerritoryDataMetadata: typeof internal.TerritoryDataMetadata = internal.TerritoryDataMetadata;

/**
 * CLDR JSON release tag used for the generated territory dataset.
 *
 * @example
 * ```typescript
 * import { TerritoryDataReleaseTag } from "@beep/data/Territories"
 *
 * console.assert(TerritoryDataReleaseTag === "48.2.0")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const TerritoryDataReleaseTag: typeof internal.TerritoryDataReleaseTag = internal.TerritoryDataReleaseTag;

/**
 * Generated CLDR territory entries.
 *
 * @example
 * ```typescript
 * import { TerritoryDataValues } from "@beep/data/Territories"
 *
 * const unitedStates = TerritoryDataValues.find((entry) => entry.code === "US")
 * console.assert(unitedStates?.name === "United States")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const TerritoryDataValues: typeof internal.TerritoryDataValues = internal.TerritoryDataValues;

/**
 * Generated CLDR territory entries keyed by territory code.
 *
 * @example
 * ```typescript
 * import { TerritoryDataByCode } from "@beep/data/Territories"
 *
 * console.assert(TerritoryDataByCode.US.name === "United States")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const TerritoryDataByCode: typeof internal.TerritoryDataByCode = internal.TerritoryDataByCode;

/**
 * Generated CLDR territory code literals.
 *
 * @example
 * ```typescript
 * import { TerritoryCodeValues } from "@beep/data/Territories"
 *
 * console.assert(TerritoryCodeValues.includes("US"))
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const TerritoryCodeValues: typeof internal.TerritoryCodeValues = internal.TerritoryCodeValues;

/**
 * Generated CLDR territory names keyed by territory code.
 *
 * @example
 * ```typescript
 * import { TerritoryDataNameByCode } from "@beep/data/Territories"
 *
 * console.assert(TerritoryDataNameByCode.US === "United States")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const TerritoryDataNameByCode: typeof internal.TerritoryDataNameByCode = internal.TerritoryDataNameByCode;

/**
 * Generated CLDR territory code to English display-name literal pairs.
 *
 * @example
 * ```typescript
 * import { TerritoryDataCodeNamePairs } from "@beep/data/Territories"
 *
 * const unitedStates = TerritoryDataCodeNamePairs.find(([code]) => code === "US")
 * console.assert(unitedStates?.[1] === "United States")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const TerritoryDataCodeNamePairs: typeof internal.TerritoryDataCodeNamePairs =
  internal.TerritoryDataCodeNamePairs;

/**
 * Generated CLDR continent entries.
 *
 * @example
 * ```typescript
 * import { ContinentDataValues } from "@beep/data/Territories"
 *
 * const americas = ContinentDataValues.find((entry) => entry.code === "019")
 * console.assert(americas?.name === "Americas")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ContinentDataValues: typeof internal.ContinentDataValues = internal.ContinentDataValues;

/**
 * Generated CLDR continent entries keyed by CLDR region code.
 *
 * @example
 * ```typescript
 * import { ContinentDataByCode } from "@beep/data/Territories"
 *
 * console.assert(ContinentDataByCode["019"].name === "Americas")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ContinentDataByCode: typeof internal.ContinentDataByCode = internal.ContinentDataByCode;

/**
 * Generated CLDR continent code literals.
 *
 * @example
 * ```typescript
 * import { ContinentCodeValues } from "@beep/data/Territories"
 *
 * console.assert(ContinentCodeValues.includes("019"))
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ContinentCodeValues: typeof internal.ContinentCodeValues = internal.ContinentCodeValues;

/**
 * Generated CLDR continent names keyed by CLDR region code.
 *
 * @example
 * ```typescript
 * import { ContinentDataNameByCode } from "@beep/data/Territories"
 *
 * console.assert(ContinentDataNameByCode["019"] === "Americas")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ContinentDataNameByCode: typeof internal.ContinentDataNameByCode = internal.ContinentDataNameByCode;

/**
 * Generated CLDR continent code to English display-name literal pairs.
 *
 * @example
 * ```typescript
 * import { ContinentDataCodeNamePairs } from "@beep/data/Territories"
 *
 * const americas = ContinentDataCodeNamePairs.find(([code]) => code === "019")
 * console.assert(americas?.[1] === "Americas")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ContinentDataCodeNamePairs: typeof internal.ContinentDataCodeNamePairs =
  internal.ContinentDataCodeNamePairs;
