/**
 * Architecture lab Drizzle schema.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.1.0
 */

import { workItemTable } from "./aggregates/WorkItem/index.js";

/**
 * Architecture lab drizzle schema.
 *
 * @category tables
 * @since 0.1.0
 */
export const DbSchema = {
  workItem: workItemTable,
} as const;

/**
 * Architecture lab drizzle schema type.
 *
 * @category tables
 * @since 0.1.0
 */
export type DbSchema = typeof DbSchema;
