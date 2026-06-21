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
 * @since 0.0.0
 * @category models
 */
export type TerritoryData = (typeof internal.TerritoryDataValues)[number];

/**
 * Union of generated CLDR territory code strings.
 *
 * @since 0.0.0
 * @category models
 */
export type TerritoryCode = TerritoryData["code"];

/**
 * Union of generated CLDR territory display names.
 *
 * @since 0.0.0
 * @category models
 */
export type TerritoryName = TerritoryData["name"];

/**
 * A single generated CLDR continent entry.
 *
 * @since 0.0.0
 * @category models
 */
export type ContinentData = (typeof internal.ContinentDataValues)[number];

/**
 * Union of generated CLDR continent code strings.
 *
 * @since 0.0.0
 * @category models
 */
export type ContinentCode = ContinentData["code"];

/**
 * Union of generated CLDR continent display names.
 *
 * @since 0.0.0
 * @category models
 */
export type ContinentName = ContinentData["name"];

/**
 * Stable source metadata for the generated CLDR territory dataset.
 *
 * @since 0.0.0
 * @category constants
 */
export const TerritoryDataMetadata: typeof internal.TerritoryDataMetadata = internal.TerritoryDataMetadata;

/**
 * CLDR JSON release tag used for the generated territory dataset.
 *
 * @since 0.0.0
 * @category constants
 */
export const TerritoryDataReleaseTag: typeof internal.TerritoryDataReleaseTag = internal.TerritoryDataReleaseTag;

/**
 * Generated CLDR territory entries.
 *
 * @since 0.0.0
 * @category constants
 */
export const TerritoryDataValues: typeof internal.TerritoryDataValues = internal.TerritoryDataValues;

/**
 * Generated CLDR territory entries keyed by territory code.
 *
 * @since 0.0.0
 * @category constants
 */
export const TerritoryDataByCode: typeof internal.TerritoryDataByCode = internal.TerritoryDataByCode;

/**
 * Generated CLDR territory code literals.
 *
 * @since 0.0.0
 * @category constants
 */
export const TerritoryCodeValues: typeof internal.TerritoryCodeValues = internal.TerritoryCodeValues;

/**
 * Generated CLDR territory names keyed by territory code.
 *
 * @since 0.0.0
 * @category constants
 */
export const TerritoryDataNameByCode: typeof internal.TerritoryDataNameByCode = internal.TerritoryDataNameByCode;

/**
 * Generated CLDR territory code to English display-name literal pairs.
 *
 * @since 0.0.0
 * @category constants
 */
export const TerritoryDataCodeNamePairs: typeof internal.TerritoryDataCodeNamePairs =
  internal.TerritoryDataCodeNamePairs;

/**
 * Generated CLDR continent entries.
 *
 * @since 0.0.0
 * @category constants
 */
export const ContinentDataValues: typeof internal.ContinentDataValues = internal.ContinentDataValues;

/**
 * Generated CLDR continent entries keyed by CLDR region code.
 *
 * @since 0.0.0
 * @category constants
 */
export const ContinentDataByCode: typeof internal.ContinentDataByCode = internal.ContinentDataByCode;

/**
 * Generated CLDR continent code literals.
 *
 * @since 0.0.0
 * @category constants
 */
export const ContinentCodeValues: typeof internal.ContinentCodeValues = internal.ContinentCodeValues;

/**
 * Generated CLDR continent names keyed by CLDR region code.
 *
 * @since 0.0.0
 * @category constants
 */
export const ContinentDataNameByCode: typeof internal.ContinentDataNameByCode = internal.ContinentDataNameByCode;

/**
 * Generated CLDR continent code to English display-name literal pairs.
 *
 * @since 0.0.0
 * @category constants
 */
export const ContinentDataCodeNamePairs: typeof internal.ContinentDataCodeNamePairs =
  internal.ContinentDataCodeNamePairs;
