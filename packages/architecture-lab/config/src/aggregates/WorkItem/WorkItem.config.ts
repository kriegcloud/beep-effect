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
 * Client-safe WorkItem configuration.
 *
 * @example
 * ```ts
 * import { WorkItemPublicConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * console.log(WorkItemPublicConfig)
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
 * Server-only WorkItem configuration.
 *
 * @example
 * ```ts
 * import { WorkItemServerConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * console.log(WorkItemServerConfig)
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
 * Secret WorkItem configuration.
 *
 * @example
 * ```ts
 * import { WorkItemSecretConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * console.log(WorkItemSecretConfig)
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
 * Default client-safe WorkItem configuration.
 *
 * @example
 * ```ts
 * import { defaultWorkItemPublicConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * console.log(defaultWorkItemPublicConfig)
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
 * Default server WorkItem configuration.
 *
 * @example
 * ```ts
 * import { defaultWorkItemServerConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * console.log(defaultWorkItemServerConfig)
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
 * Default secret WorkItem configuration.
 *
 * @example
 * ```ts
 * import { defaultWorkItemSecretConfig } from "@beep/architecture-lab-config/aggregates/WorkItem"
 *
 * console.log(defaultWorkItemSecretConfig)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const defaultWorkItemSecretConfig = WorkItemSecretConfig.make({
  connectionName: "architecture-lab-proof",
});
