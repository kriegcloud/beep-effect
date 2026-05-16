/**
 * Architecture lab server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { CanvasConfigLive } from "@beep/canvas-config/layer";
import { Layer } from "effect";

import { CanvasProjectServerLayer } from "./aggregates/CanvasProject/index.ts";
import { WorkerServerLayer } from "./entities/Worker/index.ts";

/**
 * Live canvas server layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const CanvasServerLive = Layer.mergeAll(CanvasProjectServerLayer, WorkerServerLayer).pipe(
  Layer.provide(CanvasConfigLive)
);
