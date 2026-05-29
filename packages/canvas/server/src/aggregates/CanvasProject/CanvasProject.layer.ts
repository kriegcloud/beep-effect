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
 * @category layers
 * @since 0.0.0
 */
export const CanvasProjectServerLayer = Layer.effect(CanvasProjectServer, makeCanvasProjectServer());
