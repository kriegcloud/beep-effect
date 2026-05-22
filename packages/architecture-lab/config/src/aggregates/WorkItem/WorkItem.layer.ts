/**
 * WorkItem configuration layers.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { $ArchitectureLabConfigId } from "@beep/identity/packages";
import { Config, Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";

import {
  defaultWorkItemPublicConfig,
  defaultWorkItemSecretConfig,
  defaultWorkItemServerConfig,
  WorkItemPublicConfig,
  WorkItemSecretConfig,
  WorkItemServerConfig,
} from "./WorkItem.config.js";

const $I = $ArchitectureLabConfigId.create("WorkItemConfigLayer");

/**
 * WorkItem configuration value.
 *
 * @category layers
 * @since 0.0.0
 */
export class WorkItemConfigValue extends S.Class<WorkItemConfigValue>($I`WorkItemConfigValue`)(
  {
    publicConfig: WorkItemPublicConfig,
    secretConfig: WorkItemSecretConfig,
    serverConfig: WorkItemServerConfig,
  },
  $I.annote("WorkItemConfigValue", {
    title: "WorkItem config value",
    description: "Resolved configuration value for the architecture lab WorkItem proof.",
  })
) {}

/**
 * WorkItem configuration service contract.
 *
 * @category layers
 * @since 0.0.0
 */
export type WorkItemConfigShape = WorkItemConfigValue;

/**
 * WorkItem configuration service.
 *
 * @category layers
 * @since 0.0.0
 */
export class WorkItemConfig extends Context.Service<WorkItemConfig, WorkItemConfigShape>()($I`WorkItemConfig`) {}

const readWorkItemConfig = Effect.fn("ArchitectureLab.WorkItemConfig.read")(function* () {
  const assignmentEnabled = yield* Config.boolean("ARCHITECTURE_LAB_WORK_ITEM_ASSIGNMENT_ENABLED").pipe(
    Config.withDefault(defaultWorkItemPublicConfig.assignmentEnabled)
  );
  const reopenCompletedEnabled = yield* Config.boolean("ARCHITECTURE_LAB_WORK_ITEM_REOPEN_COMPLETED_ENABLED").pipe(
    Config.withDefault(defaultWorkItemPublicConfig.reopenCompletedEnabled)
  );
  const repositoryName = yield* Config.string("ARCHITECTURE_LAB_WORK_ITEM_REPOSITORY_NAME").pipe(
    Config.withDefault(defaultWorkItemServerConfig.repositoryName)
  );
  const migrationSchemaName = yield* Config.string("ARCHITECTURE_LAB_WORK_ITEM_MIGRATION_SCHEMA_NAME").pipe(
    Config.withDefault(defaultWorkItemServerConfig.migrationSchemaName)
  );
  const connectionName = yield* Config.string("ARCHITECTURE_LAB_WORK_ITEM_CONNECTION_NAME").pipe(
    Config.withDefault(defaultWorkItemSecretConfig.connectionName)
  );

  return WorkItemConfigValue.make({
    publicConfig: WorkItemPublicConfig.make({ assignmentEnabled, reopenCompletedEnabled }),
    serverConfig: WorkItemServerConfig.make({ repositoryName, migrationSchemaName }),
    secretConfig: WorkItemSecretConfig.make({ connectionName }),
  });
});

/**
 * Test WorkItem configuration value.
 *
 * @category layers
 * @since 0.0.0
 */
export const testWorkItemConfig = WorkItemConfigValue.make({
  publicConfig: defaultWorkItemPublicConfig,
  serverConfig: defaultWorkItemServerConfig,
  secretConfig: defaultWorkItemSecretConfig,
});

/**
 * Live WorkItem configuration layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const ArchitectureLabConfigLive = Layer.effect(WorkItemConfig, readWorkItemConfig());

/**
 * Test WorkItem configuration layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const ArchitectureLabConfigTest = Layer.succeed(WorkItemConfig, testWorkItemConfig);
