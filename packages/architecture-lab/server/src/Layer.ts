/**
 * Architecture lab server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { ArchitectureLabConfigLive } from "@beep/architecture-lab-config/layer";
import { Layer } from "effect";
import { WorkItemServerLayer } from "./aggregates/WorkItem/index.ts";
import { WorkerServerLayer } from "./entities/Worker/index.ts";

/**
 * Live architecture lab server layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const ArchitectureLabServerLive = Layer.mergeAll(WorkItemServerLayer, WorkerServerLayer).pipe(
  Layer.provide(ArchitectureLabConfigLive)
);
