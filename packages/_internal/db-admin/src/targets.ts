/**
 * db-admin migration target registry.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.0.0
 */

import { Effect } from "effect";
import { ArchitectureLabMigrationTarget } from "./migrations/ArchitectureLab.js";
import { EpistemicUsageMigrationTarget } from "./migrations/EpistemicUsage.js";
import { WorkspaceThreadMigrationTarget } from "./migrations/WorkspaceThread.js";
import type { DbAdminMigrationTarget } from "./migrations/ArchitectureLab.js";

/**
 * Architecture lab migration target export.
 *
 * @category configuration
 * @since 0.0.0
 */
/**
 * Epistemic usage migration target export.
 *
 * @category configuration
 * @since 0.0.0
 */
/**
 * Workspace thread migration target export.
 *
 * @category configuration
 * @since 0.0.0
 */
export { ArchitectureLabMigrationTarget, EpistemicUsageMigrationTarget, WorkspaceThreadMigrationTarget };

/**
 * All db-admin migration targets owned by the current repo.
 *
 * @example
 * ```ts
 * import { DbAdminMigrationTargets } from "@beep/db-admin/targets"
 *
 * console.log(DbAdminMigrationTargets)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const DbAdminMigrationTargets = [
  ArchitectureLabMigrationTarget,
  WorkspaceThreadMigrationTarget,
  EpistemicUsageMigrationTarget,
] as const;

/**
 * List registered db-admin migration targets.
 *
 * @example
 * ```ts
 * import { listDbAdminMigrationTargets } from "@beep/db-admin/targets"
 *
 * console.log(listDbAdminMigrationTargets)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const listDbAdminMigrationTargets: Effect.Effect<ReadonlyArray<DbAdminMigrationTarget>> =
  Effect.succeed(DbAdminMigrationTargets);
