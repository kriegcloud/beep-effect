/**
 * Worker use-case service.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import type * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import type { Effect } from "effect";
import type { CreateWorkerCommand, GetWorkerQuery, ListWorkersQuery } from "./Worker.commands.js";
import type { WorkerActionError } from "./Worker.errors.js";

const $I = $ArchitectureLabUseCasesId.create("entities/Worker/Worker.use-cases");

/**
 * Public Worker use-case contract.
 *
 * @category use-cases
 * @since 0.0.0
 */
export interface WorkerUseCasesShape {
  readonly create: (command: CreateWorkerCommand) => Effect.Effect<DomainWorker.Worker, WorkerActionError>;
  readonly get: (query: GetWorkerQuery) => Effect.Effect<DomainWorker.Worker, WorkerActionError>;
  readonly list: (query: ListWorkersQuery) => Effect.Effect<ReadonlyArray<DomainWorker.Worker>, WorkerActionError>;
}

/**
 * Public Worker use-case service.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class WorkerUseCases extends Context.Service<WorkerUseCases, WorkerUseCasesShape>()($I`WorkerUseCases`) {}
