/**
 * CanvasProject server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import * as CanvasProjectUseCaseServer from "@beep/canvas-use-cases/server";
import { $CanvasServerId } from "@beep/identity/packages";
import { Context, Effect, Layer } from "effect";
import { makeCanvasProjectRepository } from "./CanvasProject.repo.js";
import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public";

const $I = $CanvasServerId.create("aggregates/CanvasProject/CanvasProject.layer");

/**
 * Build the CanvasProject server facade.
 *
 * @example
 * ```ts
 * import { makeCanvasProjectServer } from "@beep/canvas-server/aggregates/CanvasProject"
 *
 * console.log(makeCanvasProjectServer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeCanvasProjectServer = Effect.fn("Canvas.CanvasProjectServer.make")(function* () {
  const repository = yield* makeCanvasProjectRepository();
  return CanvasProjectUseCaseServer.CanvasProject.makeCanvasProjectUseCases(repository);
});

/**
 * CanvasProject server facade service.
 *
 * @example
 * ```ts
 * import { CanvasProjectServer } from "@beep/canvas-server/aggregates/CanvasProject"
 *
 * console.log(CanvasProjectServer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export class CanvasProjectServer extends Context.Service<
  CanvasProjectServer,
  CanvasProjectUseCases.CanvasProjectUseCasesShape
>()($I`CanvasProjectServer`) {}

/**
 * Config-dependent CanvasProject server layer.
 *
 * @example
 * ```ts
 * import { CanvasProjectServerLayer } from "@beep/canvas-server/aggregates/CanvasProject"
 *
 * console.log(CanvasProjectServerLayer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const CanvasProjectServerLayer = Layer.effect(CanvasProjectServer, makeCanvasProjectServer());
