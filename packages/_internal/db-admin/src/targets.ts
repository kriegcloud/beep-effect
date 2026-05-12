/**
 * db-admin migration target registry.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.1.0
 */

import { Effect } from "effect";

import { ArchitectureLabMigrationTarget, type DbAdminMigrationTarget } from "./migrations/ArchitectureLab.js";

/**
 * Architecture lab migration target export.
 *
 * @category configuration
 * @since 0.1.0
 */
export { ArchitectureLabMigrationTarget };

/**
 * All db-admin migration targets owned by the current repo.
 *
 * @category configuration
 * @since 0.1.0
 */
export const DbAdminMigrationTargets = [ArchitectureLabMigrationTarget] as const;

/**
 * List registered db-admin migration targets.
 *
 * @category configuration
 * @since 0.1.0
 */
export const listDbAdminMigrationTargets: Effect.Effect<ReadonlyArray<DbAdminMigrationTarget>> =
  Effect.succeed(DbAdminMigrationTargets);
