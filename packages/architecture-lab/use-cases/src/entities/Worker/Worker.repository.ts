/**
 * Worker repository port.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Context } from "effect";
import * as S from "effect/Schema";
import type { Effect } from "effect";

const $I = $ArchitectureLabUseCasesId.create("entities/Worker/Worker.repository");

/**
 * Persistence failure raised when a Worker row is absent.
 *
 * @example
 * ```ts
 * import { WorkerRepositoryNotFound } from "@beep/architecture-lab-use-cases/entities/Worker/server"
 *
 * console.log(WorkerRepositoryNotFound)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkerRepositoryNotFound extends TaggedErrorClass<WorkerRepositoryNotFound>($I`WorkerRepositoryNotFound`)(
  "WorkerRepositoryNotFound",
  {
    workerId: DomainWorker.WorkerId,
  },
  $I.annote("WorkerRepositoryNotFound", {
    title: "Worker repository not found",
    description: "The Worker repository could not find the requested entity.",
  })
) {}

/**
 * Persistence failure raised when a Worker write conflicts.
 *
 * @example
 * ```ts
 * import { WorkerRepositoryConflict } from "@beep/architecture-lab-use-cases/entities/Worker/server"
 *
 * console.log(WorkerRepositoryConflict)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkerRepositoryConflict extends TaggedErrorClass<WorkerRepositoryConflict>($I`WorkerRepositoryConflict`)(
  "WorkerRepositoryConflict",
  {
    workerId: DomainWorker.WorkerId,
    reason: S.String,
  },
  $I.annote("WorkerRepositoryConflict", {
    title: "Worker repository conflict",
    description: "The Worker repository rejected a conflicting write.",
  })
) {}

/**
 * Persistence failure raised when the Worker repository is unavailable.
 *
 * @example
 * ```ts
 * import { WorkerRepositoryUnavailable } from "@beep/architecture-lab-use-cases/entities/Worker/server"
 *
 * console.log(WorkerRepositoryUnavailable)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkerRepositoryUnavailable extends TaggedErrorClass<WorkerRepositoryUnavailable>(
  $I`WorkerRepositoryUnavailable`
)(
  "WorkerRepositoryUnavailable",
  {
    reason: S.String,
  },
  $I.annote("WorkerRepositoryUnavailable", {
    title: "Worker repository unavailable",
    description: "The Worker repository could not serve the request.",
  })
) {}

/**
 * Worker repository failure.
 *
 * @example
 * ```ts
 * import type { WorkerRepositoryError } from "@beep/architecture-lab-use-cases/entities/Worker/server"
 *
 * const value = {} as WorkerRepositoryError
 * console.log(value)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export type WorkerRepositoryError = WorkerRepositoryNotFound | WorkerRepositoryConflict | WorkerRepositoryUnavailable;

/**
 * Worker repository contract.
 *
 * @example
 * ```ts
 * import type { WorkerRepositoryShape } from "@beep/architecture-lab-use-cases/entities/Worker/server"
 *
 * const value = {} as WorkerRepositoryShape
 * console.log(value)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export interface WorkerRepositoryShape {
  readonly create: (
    worker: DomainWorker.Worker
  ) => Effect.Effect<DomainWorker.Worker, WorkerRepositoryConflict | WorkerRepositoryUnavailable>;
  readonly get: (
    id: DomainWorker.WorkerId
  ) => Effect.Effect<DomainWorker.Worker, WorkerRepositoryNotFound | WorkerRepositoryUnavailable>;
  readonly list: Effect.Effect<ReadonlyArray<DomainWorker.Worker>, WorkerRepositoryUnavailable>;
}

/**
 * Worker repository service.
 *
 * @example
 * ```ts
 * import { WorkerRepository } from "@beep/architecture-lab-use-cases/entities/Worker/server"
 *
 * console.log(WorkerRepository)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkerRepository extends Context.Service<WorkerRepository, WorkerRepositoryShape>()(
  $I`WorkerRepository`
) {}
