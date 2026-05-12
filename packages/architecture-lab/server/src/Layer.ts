/**
 * Architecture lab server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.1.0
 */

import { ArchitectureLabConfigLive } from "@beep/architecture-lab-config/layer";
import { Layer } from "effect";

import { WorkItemServerLayer } from "./aggregates/WorkItem/index.ts";

/**
 * Live architecture lab server layer.
 *
 * @category layers
 * @since 0.1.0
 */
export const ArchitectureLabServerLive = WorkItemServerLayer.pipe(Layer.provide(ArchitectureLabConfigLive));
