/**
 * Worker server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.1.0
 */

import type { Worker as WorkerUseCases } from "@beep/architecture-lab-use-cases/public";
import * as WorkerUseCaseServer from "@beep/architecture-lab-use-cases/server";
import { $ArchitectureLabServerId } from "@beep/identity/packages";
import { Context, Effect, Layer } from "effect";
import { makeWorkerRepository } from "./Worker.repo.js";

const $I = $ArchitectureLabServerId.create("entities/Worker/Worker.layer");

/**
 * Build the Worker server facade.
 *
 * @category layers
 * @since 0.1.0
 */
export const makeWorkerServer = Effect.fn("ArchitectureLab.WorkerServer.make")(function* () {
  const repository = yield* makeWorkerRepository();
  return WorkerUseCaseServer.Worker.makeWorkerUseCases(repository);
});

/**
 * Worker server facade service.
 *
 * @category layers
 * @since 0.1.0
 */
export class WorkerServer extends Context.Service<WorkerServer, WorkerUseCases.WorkerUseCasesShape>()(
  $I`WorkerServer`
) {}

/**
 * Worker server layer.
 *
 * @category layers
 * @since 0.1.0
 */
export const WorkerServerLayer = Layer.effect(WorkerServer, makeWorkerServer());
