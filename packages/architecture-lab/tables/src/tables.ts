/**
 * Architecture lab Drizzle schema.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.1.0
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
 * @category tables
 * @since 0.1.0
 */
export const DbSchema: DbSchemaShape = {
  workItem: WorkItem.workItemTable,
  worker: Worker.workerTable,
};

/**
 * Architecture lab drizzle schema type.
 *
 * @category tables
 * @since 0.1.0
 */
export type DbSchema = DbSchemaShape;
