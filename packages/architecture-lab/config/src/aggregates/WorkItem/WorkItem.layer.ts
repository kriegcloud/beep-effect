/**
 * WorkItem configuration layers.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.1.0
 */

import { $ArchitectureLabConfigId } from "@beep/identity/packages";
import { Context, Layer } from "effect";

import {
  defaultWorkItemPublicConfig,
  defaultWorkItemSecretConfig,
  defaultWorkItemServerConfig,
  type WorkItemPublicConfig,
  type WorkItemSecretConfig,
  type WorkItemServerConfig,
} from "./WorkItem.config.js";

const $I = $ArchitectureLabConfigId.create("WorkItemConfigLayer");

/**
 * WorkItem configuration service contract.
 *
 * @category layers
 * @since 0.1.0
 */
export interface WorkItemConfigShape {
  readonly publicConfig: WorkItemPublicConfig;
  readonly secretConfig: WorkItemSecretConfig;
  readonly serverConfig: WorkItemServerConfig;
}

/**
 * WorkItem configuration service.
 *
 * @category layers
 * @since 0.1.0
 */
export class WorkItemConfig extends Context.Service<WorkItemConfig, WorkItemConfigShape>()($I`WorkItemConfig`) {}

/**
 * Test WorkItem configuration value.
 *
 * @category layers
 * @since 0.1.0
 */
export const testWorkItemConfig = WorkItemConfig.of({
  publicConfig: defaultWorkItemPublicConfig,
  serverConfig: defaultWorkItemServerConfig,
  secretConfig: defaultWorkItemSecretConfig,
});

/**
 * Live WorkItem configuration layer.
 *
 * @category layers
 * @since 0.1.0
 */
export const ArchitectureLabConfigLive = Layer.succeed(WorkItemConfig, testWorkItemConfig);

/**
 * Test WorkItem configuration layer.
 *
 * @category layers
 * @since 0.1.0
 */
export const ArchitectureLabConfigTest = ArchitectureLabConfigLive;
