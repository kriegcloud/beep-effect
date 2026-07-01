/**
 * WorkItem configuration models.
 *
 * @packageDocumentation
 * @category configuration
 * @since 0.0.0
 */

import { $ArchitectureLabConfigId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $ArchitectureLabConfigId.create("WorkItemConfig");

/**
 * Client-safe feature flags for WorkItem behavior.
 *
 * @example
 * ```ts
 * import { WorkItemPublicConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 * import * as S from "effect/Schema"
 *
 * const config = S.decodeUnknownSync(WorkItemPublicConfig)({
 *   assignmentEnabled: true,
 *   reopenCompletedEnabled: false
 * })
 *
 * console.log(config.reopenCompletedEnabled) // false
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class WorkItemPublicConfig extends S.Class<WorkItemPublicConfig>($I`WorkItemPublicConfig`)(
  {
    assignmentEnabled: S.Boolean,
    reopenCompletedEnabled: S.Boolean,
  },
  $I.annote("WorkItemPublicConfig", {
    title: "WorkItem public config",
    description: "Client-safe feature flags for the architecture lab WorkItem proof.",
  })
) {}

/**
 * Server-only repository and migration settings for WorkItem persistence.
 *
 * @example
 * ```ts
 * import { WorkItemServerConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 * import * as S from "effect/Schema"
 *
 * const config = S.decodeUnknownSync(WorkItemServerConfig)({
 *   repositoryName: "architecture-lab-work-items",
 *   migrationSchemaName: "architecture_lab"
 * })
 *
 * console.log(config.repositoryName) // "architecture-lab-work-items"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class WorkItemServerConfig extends S.Class<WorkItemServerConfig>($I`WorkItemServerConfig`)(
  {
    repositoryName: S.String,
    migrationSchemaName: S.String,
  },
  $I.annote("WorkItemServerConfig", {
    title: "WorkItem server config",
    description: "Server-side repository and migration names for the architecture lab WorkItem proof.",
  })
) {}

/**
 * Secret-reference configuration for the WorkItem backing connection.
 *
 * @example
 * ```ts
 * import { WorkItemSecretConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 * import * as S from "effect/Schema"
 *
 * const config = S.decodeUnknownSync(WorkItemSecretConfig)({
 *   connectionName: "architecture-lab-proof"
 * })
 *
 * console.log(config.connectionName) // "architecture-lab-proof"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class WorkItemSecretConfig extends S.Class<WorkItemSecretConfig>($I`WorkItemSecretConfig`)(
  {
    connectionName: S.String,
  },
  $I.annote("WorkItemSecretConfig", {
    title: "WorkItem secret config",
    description: "Secret connection reference for the architecture lab WorkItem proof.",
  })
) {}

/**
 * Default browser-safe WorkItem feature flags used by test and local layers.
 *
 * @example
 * ```ts
 * import { defaultWorkItemPublicConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * const bothActionsEnabled =
 *   defaultWorkItemPublicConfig.assignmentEnabled &&
 *   defaultWorkItemPublicConfig.reopenCompletedEnabled
 *
 * console.log(bothActionsEnabled) // true
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const defaultWorkItemPublicConfig = WorkItemPublicConfig.make({
  assignmentEnabled: true,
  reopenCompletedEnabled: true,
});

/**
 * Default server-side WorkItem repository and migration names.
 *
 * @example
 * ```ts
 * import { defaultWorkItemServerConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * console.log(defaultWorkItemServerConfig.migrationSchemaName) // "architecture_lab"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const defaultWorkItemServerConfig = WorkItemServerConfig.make({
  repositoryName: "architecture-lab-work-items",
  migrationSchemaName: "architecture_lab",
});

/**
 * Default WorkItem secret reference name for local proof wiring.
 *
 * @example
 * ```ts
 * import { defaultWorkItemSecretConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * console.log(defaultWorkItemSecretConfig.connectionName) // "architecture-lab-proof"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const defaultWorkItemSecretConfig = WorkItemSecretConfig.make({
  connectionName: "architecture-lab-proof",
});
