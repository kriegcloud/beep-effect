/**
 * WorkItem repository port.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Context } from "effect";
import * as S from "effect/Schema";
import type { Effect } from "effect";

const $I = $ArchitectureLabUseCasesId.create("aggregates/WorkItem/WorkItem.repository");

/**
 * Persistence failure raised when a WorkItem row is absent.
 *
 * @example
 * ```ts
 * import { WorkItemRepositoryNotFound } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"
 *
 * console.log(WorkItemRepositoryNotFound)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkItemRepositoryNotFound extends TaggedErrorClass<WorkItemRepositoryNotFound>(
  $I`WorkItemRepositoryNotFound`
)(
  "WorkItemRepositoryNotFound",
  {
    workItemId: DomainWorkItem.WorkItemId,
  },
  $I.annote("WorkItemRepositoryNotFound", {
    title: "WorkItem repository not found",
    description: "The WorkItem repository could not find the requested aggregate.",
  })
) {}

/**
 * Persistence failure raised when a WorkItem write conflicts.
 *
 * @example
 * ```ts
 * import { WorkItemRepositoryConflict } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"
 *
 * console.log(WorkItemRepositoryConflict)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkItemRepositoryConflict extends TaggedErrorClass<WorkItemRepositoryConflict>(
  $I`WorkItemRepositoryConflict`
)(
  "WorkItemRepositoryConflict",
  {
    workItemId: DomainWorkItem.WorkItemId,
    reason: S.String,
  },
  $I.annote("WorkItemRepositoryConflict", {
    title: "WorkItem repository conflict",
    description: "The WorkItem repository rejected a conflicting write.",
  })
) {}

/**
 * Persistence failure raised when the WorkItem repository is unavailable.
 *
 * @example
 * ```ts
 * import { WorkItemRepositoryUnavailable } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"
 *
 * console.log(WorkItemRepositoryUnavailable)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkItemRepositoryUnavailable extends TaggedErrorClass<WorkItemRepositoryUnavailable>(
  $I`WorkItemRepositoryUnavailable`
)(
  "WorkItemRepositoryUnavailable",
  {
    reason: S.String,
  },
  $I.annote("WorkItemRepositoryUnavailable", {
    title: "WorkItem repository unavailable",
    description: "The WorkItem repository could not serve the request.",
  })
) {}

/**
 * WorkItem repository failure.
 *
 * @example
 * ```ts
 * import type { WorkItemRepositoryError } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"
 *
 * const value = {} as WorkItemRepositoryError
 * console.log(value)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export type WorkItemRepositoryError =
  | WorkItemRepositoryNotFound
  | WorkItemRepositoryConflict
  | WorkItemRepositoryUnavailable;

/**
 * WorkItem repository contract.
 *
 * @example
 * ```ts
 * import type { WorkItemRepositoryShape } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"
 *
 * const value = {} as WorkItemRepositoryShape
 * console.log(value)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export interface WorkItemRepositoryShape {
  readonly create: (
    workItem: DomainWorkItem.WorkItem
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemRepositoryConflict | WorkItemRepositoryUnavailable>;
  readonly get: (
    id: DomainWorkItem.WorkItemId
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemRepositoryNotFound | WorkItemRepositoryUnavailable>;
  readonly list: Effect.Effect<ReadonlyArray<DomainWorkItem.WorkItem>, WorkItemRepositoryUnavailable>;
  readonly save: (
    workItem: DomainWorkItem.WorkItem
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemRepositoryNotFound | WorkItemRepositoryUnavailable>;
}

/**
 * WorkItem repository service.
 *
 * @example
 * ```ts
 * import { WorkItemRepository } from "@beep/architecture-lab-use-cases/aggregates/WorkItem/server"
 *
 * console.log(WorkItemRepository)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkItemRepository extends Context.Service<WorkItemRepository, WorkItemRepositoryShape>()(
  $I`WorkItemRepository`
) {}
