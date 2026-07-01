/**
 * Architecture lab db-admin migration target.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.0.0
 */

import { WORK_ITEM_TABLE_NAME } from "@beep/architecture-lab-tables/aggregates/WorkItem";
import { WORKER_TABLE_NAME } from "@beep/architecture-lab-tables/entities/Worker";
import { DbSchema } from "@beep/architecture-lab-tables/tables";
import { $I as $BeepId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $BeepId.create("db-admin/migrations/ArchitectureLab");

/**
 * db-admin migration target metadata.
 *
 * @example
 * ```ts
 * import { DbAdminMigrationTarget } from "@beep/db-admin/migrations/ArchitectureLab"
 *
 * const target = DbAdminMigrationTarget.make({
 *   drizzleSchema: {},
 *   name: "docs",
 *   schemaName: "docs",
 *   tables: ["docs_items"]
 * })
 * console.log(target.tables) // ["docs_items"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DbAdminMigrationTarget extends S.Class<DbAdminMigrationTarget>($I`DbAdminMigrationTarget`)(
  {
    drizzleSchema: S.Unknown,
    name: S.String,
    schemaName: S.String,
    tables: S.Array(S.String),
  },
  $I.annote("DbAdminMigrationTarget", {
    title: "db-admin migration target",
    description: "Migration target metadata consumed by the db-admin aggregation proof.",
  })
) {}

/**
 * Architecture lab migration target used to prove current db-admin aggregation.
 *
 * @example
 * ```ts
 * import { ArchitectureLabMigrationTarget } from "@beep/db-admin/migrations/ArchitectureLab"
 *
 * const summary = {
 *   schemaName: ArchitectureLabMigrationTarget.schemaName,
 *   tableCount: ArchitectureLabMigrationTarget.tables.length
 * }
 * console.log(summary) // { schemaName: "architecture_lab", tableCount: 2 }
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const ArchitectureLabMigrationTarget: DbAdminMigrationTarget = DbAdminMigrationTarget.make({
  name: "architecture-lab",
  schemaName: "architecture_lab",
  tables: [WORK_ITEM_TABLE_NAME, WORKER_TABLE_NAME],
  drizzleSchema: DbSchema,
});
