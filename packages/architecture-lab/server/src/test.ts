/**
 * Architecture lab server test layer.
 *
 * @packageDocumentation
 * @category testing
 * @since 0.1.0
 */

import { ArchitectureLabConfigTest } from "@beep/architecture-lab-config/test";
import { Layer } from "effect";

import { WorkItemServerLayer } from "./aggregates/WorkItem/index.ts";
import { WorkerServerLayer } from "./entities/Worker/index.ts";

/**
 * Test architecture lab server layer.
 *
 * @category testing
 * @since 0.1.0
 */
export const ArchitectureLabServerTest = Layer.mergeAll(WorkItemServerLayer, WorkerServerLayer).pipe(
  Layer.provide(ArchitectureLabConfigTest)
);
