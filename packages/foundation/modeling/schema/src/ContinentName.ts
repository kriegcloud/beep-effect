/**
 * CLDR continent display-name schema.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ContinentName as ContinentNameSchema } from "./ContinentCode.ts";

/**
 * CLDR top-level territory containment display-name schema.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ContinentName = ContinentNameSchema;

/**
 * {@inheritDoc ContinentName}
 *
 * @since 0.0.0
 * @category models
 */
export type ContinentName = typeof ContinentName.Type;
