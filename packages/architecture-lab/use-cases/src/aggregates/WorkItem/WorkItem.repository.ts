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
import { Context, type Effect } from "effect";
import * as S from "effect/Schema";

const $I = $ArchitectureLabUseCasesId.create("aggregates/WorkItem/WorkItem.repository");

/**
 * Persistence failure raised when a WorkItem row is absent.
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
  readonly list: () => Effect.Effect<ReadonlyArray<DomainWorkItem.WorkItem>, WorkItemRepositoryUnavailable>;
  readonly save: (
    workItem: DomainWorkItem.WorkItem
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemRepositoryNotFound | WorkItemRepositoryUnavailable>;
}

/**
 * WorkItem repository service.
 *
 * @category repositories
 * @since 0.0.0
 */
export class WorkItemRepository extends Context.Service<WorkItemRepository, WorkItemRepositoryShape>()(
  $I`WorkItemRepository`
) {}
