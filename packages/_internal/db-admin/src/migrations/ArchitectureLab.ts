/**
 * Architecture lab db-admin migration target.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.1.0
 */

import { WORK_ITEM_TABLE_NAME } from "@beep/architecture-lab-tables/aggregates/WorkItem";
import { DbSchema } from "@beep/architecture-lab-tables/tables";

/**
 * db-admin migration target metadata.
 *
 * @category configuration
 * @since 0.1.0
 */
export interface DbAdminMigrationTarget {
  readonly drizzleSchema: unknown;
  readonly name: string;
  readonly schemaName: string;
  readonly tables: ReadonlyArray<string>;
}

/**
 * Architecture lab migration target used to prove current db-admin aggregation.
 *
 * @category configuration
 * @since 0.1.0
 */
export const ArchitectureLabMigrationTarget: DbAdminMigrationTarget = {
  name: "architecture-lab",
  schemaName: "architecture_lab",
  tables: [WORK_ITEM_TABLE_NAME],
  drizzleSchema: DbSchema,
};
