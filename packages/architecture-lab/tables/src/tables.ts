/**
 * Architecture lab Drizzle schema.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.0.0
 */

import * as WorkItem from "./aggregates/WorkItem/index.js";
import * as Worker from "./entities/Worker/index.js";

type DbSchemaShape = {
  readonly workItem: typeof WorkItem.workItemTable;
  readonly worker: typeof Worker.workerTable;
};

/**
 * Architecture lab drizzle schema.
 *
 * @example
 * ```ts
 * import { DbSchema } from "@beep/architecture-lab-tables/tables"
 *
 * console.log(DbSchema)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const DbSchema: DbSchemaShape = {
  workItem: WorkItem.workItemTable,
  worker: Worker.workerTable,
};

/**
 * Architecture lab drizzle schema type.
 *
 * @example
 * ```ts
 * import type { DbSchema } from "@beep/architecture-lab-tables/tables"
 *
 * const value = {} as DbSchema
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type DbSchema = DbSchemaShape;
