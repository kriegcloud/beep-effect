/**
 * CLDR territory display-name schema.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { TerritoryName as TerritoryNameSchema } from "./TerritoryCode.ts";

/**
 * CLDR territory display-name schema.
 *
 * @since 0.0.0
 * @category schemas
 */
export const TerritoryName = TerritoryNameSchema;

/**
 * {@inheritDoc TerritoryName}
 *
 * @since 0.0.0
 * @category models
 */
export type TerritoryName = typeof TerritoryName.Type;
