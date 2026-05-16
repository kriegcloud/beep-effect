/**
 * Architecture lab server test layer.
 *
 * @packageDocumentation
 * @category testing
 * @since 0.0.0
 */

import { CanvasConfigTest } from "@beep/canvas-config/test";
import { Layer } from "effect";

import { CanvasProjectServerLayer } from "./aggregates/CanvasProject/index.ts";
import { WorkerServerLayer } from "./entities/Worker/index.ts";

/**
 * Test canvas server layer.
 *
 * @category testing
 * @since 0.0.0
 */
export const CanvasServerTest = Layer.mergeAll(CanvasProjectServerLayer, WorkerServerLayer).pipe(
  Layer.provide(CanvasConfigTest)
);
