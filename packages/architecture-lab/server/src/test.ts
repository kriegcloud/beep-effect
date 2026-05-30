/**
 * Architecture lab server test layer.
 *
 * @packageDocumentation
 * @category testing
 * @since 0.0.0
 */

import { ArchitectureLabConfigTest } from "@beep/architecture-lab-config/test";
import { Layer } from "effect";
import { WorkItemServerLayer } from "./aggregates/WorkItem/index.ts";
import { WorkerServerLayer } from "./entities/Worker/index.ts";

/**
 * Test architecture lab server layer.
 *
 * @example
 * ```ts
 * import { ArchitectureLabServerTest } from "@beep/architecture-lab-server/test"
 *
 * console.log(ArchitectureLabServerTest)
 * ```
 *
 * @category testing
 * @since 0.0.0
 */
export const ArchitectureLabServerTest = Layer.mergeAll(WorkItemServerLayer, WorkerServerLayer).pipe(
  Layer.provide(ArchitectureLabConfigTest)
);
