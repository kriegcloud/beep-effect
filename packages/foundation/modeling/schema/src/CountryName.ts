/**
 * Country display-name schema backed by generated CLDR territory names.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { TerritoryName as TerritoryNameSchema } from "./TerritoryCode.ts";

/**
 * Country display-name schema backed by generated CLDR territory names.
 *
 * @since 0.0.0
 * @category schemas
 */
export const CountryName = TerritoryNameSchema;

/**
 * {@inheritDoc CountryName}
 *
 * @since 0.0.0
 * @category models
 */
export type CountryName = typeof CountryName.Type;
