/**
 * Worker use-case errors.
 *
 * @packageDocumentation
 * @category errors
 * @since 0.0.0
 */

import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ArchitectureLabUseCasesId.create("entities/Worker/Worker.errors");

/**
 * Generic public reason used when internal Worker repository details are redacted.
 *
 * @example
 * ```ts
 * import { WORKER_ACTION_UNAVAILABLE_REASON } from "@beep/architecture-lab-use-cases/entities/Worker"
 *
 * console.log(WORKER_ACTION_UNAVAILABLE_REASON)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const WORKER_ACTION_UNAVAILABLE_REASON = "Worker service is unavailable." as const;

/**
 * Public failure raised when a requested Worker is absent.
 *
 * @example
 * ```ts
 * import { WorkerNotFound } from "@beep/architecture-lab-use-cases/entities/Worker"
 *
 * console.log(WorkerNotFound)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class WorkerNotFound extends TaggedErrorClass<WorkerNotFound>($I`WorkerNotFound`)(
  "WorkerNotFound",
  {
    workerId: DomainWorker.WorkerId,
  },
  $I.annote("WorkerNotFound", {
    title: "Worker not found",
    description: "The requested architecture lab Worker does not exist.",
  })
) {}

/**
 * Public failure raised when a Worker command conflicts with persisted state.
 *
 * @example
 * ```ts
 * import { WorkerConflict } from "@beep/architecture-lab-use-cases/entities/Worker"
 *
 * console.log(WorkerConflict)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class WorkerConflict extends TaggedErrorClass<WorkerConflict>($I`WorkerConflict`)(
  "WorkerConflict",
  {
    workerId: DomainWorker.WorkerId,
    reason: S.String,
  },
  $I.annote("WorkerConflict", {
    title: "Worker conflict",
    description: "The requested Worker command conflicts with persisted state.",
  })
) {}

/**
 * Public failure raised when a Worker action cannot be completed.
 *
 * @example
 * ```ts
 * import { WorkerActionFailed } from "@beep/architecture-lab-use-cases/entities/Worker"
 *
 * console.log(WorkerActionFailed)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class WorkerActionFailed extends TaggedErrorClass<WorkerActionFailed>($I`WorkerActionFailed`)(
  "WorkerActionFailed",
  {
    reason: S.String,
  },
  $I.annote("WorkerActionFailed", {
    title: "Worker action failed",
    description: "The Worker use-case action could not be completed.",
  })
) {}

/**
 * Public Worker use-case failure.
 *
 * @example
 * ```ts
 * import type { WorkerActionError } from "@beep/architecture-lab-use-cases/entities/Worker"
 *
 * const value = {} as WorkerActionError
 * console.log(value)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type WorkerActionError = WorkerNotFound | WorkerConflict | WorkerActionFailed;

/**
 * Public Worker use-case failure schema.
 *
 * @example
 * ```ts
 * import { WorkerActionError } from "@beep/architecture-lab-use-cases/entities/Worker"
 *
 * console.log(WorkerActionError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const WorkerActionError = S.Union([WorkerNotFound, WorkerConflict, WorkerActionFailed]);
