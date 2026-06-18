/**
 * Country code schema backed by generated CLDR territory codes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  TerritoryCode as TerritoryCodeSchema,
  TerritoryCodeFromName as TerritoryCodeFromNameSchema,
  TerritoryNameFromCode as TerritoryNameFromCodeSchema,
} from "./TerritoryCode.ts";

/**
 * Country code schema backed by generated CLDR territory codes.
 *
 * @since 0.0.0
 * @category schemas
 */
export const CountryCode = TerritoryCodeSchema;

/**
 * {@inheritDoc CountryCode}
 *
 * @since 0.0.0
 * @category models
 */
export type CountryCode = typeof CountryCode.Type;

/**
 * Reverse codec from country display name to country code.
 *
 * @since 0.0.0
 * @category schemas
 */
export const CountryCodeFromName = TerritoryCodeFromNameSchema;

/**
 * Reversible country code/name codec.
 *
 * @since 0.0.0
 * @category schemas
 */
export const CountryNameFromCode = TerritoryNameFromCodeSchema;
