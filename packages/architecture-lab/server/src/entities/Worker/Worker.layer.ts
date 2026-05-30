/**
 * Worker server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import * as WorkerUseCaseServer from "@beep/architecture-lab-use-cases/server";
import { $ArchitectureLabServerId } from "@beep/identity/packages";
import { Context, Effect, Layer } from "effect";
import { makeWorkerRepository } from "./Worker.repo.js";
import type { Worker as WorkerUseCases } from "@beep/architecture-lab-use-cases/public";

const $I = $ArchitectureLabServerId.create("entities/Worker/Worker.layer");

/**
 * Build the Worker server facade.
 *
 * @example
 * ```ts
 * import { makeWorkerServer } from "@beep/architecture-lab-server/entities/Worker"
 *
 * console.log(makeWorkerServer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeWorkerServer = Effect.fn("ArchitectureLab.WorkerServer.make")(function* () {
  const repository = yield* makeWorkerRepository();
  return WorkerUseCaseServer.Worker.makeWorkerUseCases(repository);
});

/**
 * Worker server facade service.
 *
 * @example
 * ```ts
 * import { WorkerServer } from "@beep/architecture-lab-server/entities/Worker"
 *
 * console.log(WorkerServer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export class WorkerServer extends Context.Service<WorkerServer, WorkerUseCases.WorkerUseCasesShape>()(
  $I`WorkerServer`
) {}

/**
 * Worker server layer.
 *
 * @example
 * ```ts
 * import { WorkerServerLayer } from "@beep/architecture-lab-server/entities/Worker"
 *
 * console.log(WorkerServerLayer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WorkerServerLayer = Layer.effect(WorkerServer, makeWorkerServer());
