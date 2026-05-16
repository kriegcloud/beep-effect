/**
 * CanvasProject repository port.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { $CanvasUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Context, type Effect } from "effect";
import * as S from "effect/Schema";

const $I = $CanvasUseCasesId.create("aggregates/CanvasProject/CanvasProject.repository");

/**
 * Persistence failure raised when a CanvasProject row is absent.
 *
 * @category repositories
 * @since 0.0.0
 */
export class CanvasProjectRepositoryNotFound extends TaggedErrorClass<CanvasProjectRepositoryNotFound>(
  $I`CanvasProjectRepositoryNotFound`
)(
  "CanvasProjectRepositoryNotFound",
  {
    canvasProjectId: DomainCanvasProject.CanvasProjectId,
  },
  $I.annote("CanvasProjectRepositoryNotFound", {
    title: "CanvasProject repository not found",
    description: "The CanvasProject repository could not find the requested aggregate.",
  })
) {}

/**
 * Persistence failure raised when a CanvasProject write conflicts.
 *
 * @category repositories
 * @since 0.0.0
 */
export class CanvasProjectRepositoryConflict extends TaggedErrorClass<CanvasProjectRepositoryConflict>(
  $I`CanvasProjectRepositoryConflict`
)(
  "CanvasProjectRepositoryConflict",
  {
    canvasProjectId: DomainCanvasProject.CanvasProjectId,
    reason: S.String,
  },
  $I.annote("CanvasProjectRepositoryConflict", {
    title: "CanvasProject repository conflict",
    description: "The CanvasProject repository rejected a conflicting write.",
  })
) {}

/**
 * Persistence failure raised when the CanvasProject repository is unavailable.
 *
 * @category repositories
 * @since 0.0.0
 */
export class CanvasProjectRepositoryUnavailable extends TaggedErrorClass<CanvasProjectRepositoryUnavailable>(
  $I`CanvasProjectRepositoryUnavailable`
)(
  "CanvasProjectRepositoryUnavailable",
  {
    reason: S.String,
  },
  $I.annote("CanvasProjectRepositoryUnavailable", {
    title: "CanvasProject repository unavailable",
    description: "The CanvasProject repository could not serve the request.",
  })
) {}

/**
 * CanvasProject repository failure.
 *
 * @category repositories
 * @since 0.0.0
 */
export type CanvasProjectRepositoryError =
  | CanvasProjectRepositoryNotFound
  | CanvasProjectRepositoryConflict
  | CanvasProjectRepositoryUnavailable;

/**
 * CanvasProject repository contract.
 *
 * @category repositories
 * @since 0.0.0
 */
export interface CanvasProjectRepositoryShape {
  readonly create: (
    canvasProject: DomainCanvasProject.CanvasProject
  ) => Effect.Effect<
    DomainCanvasProject.CanvasProject,
    CanvasProjectRepositoryConflict | CanvasProjectRepositoryUnavailable
  >;
  readonly get: (
    id: DomainCanvasProject.CanvasProjectId
  ) => Effect.Effect<
    DomainCanvasProject.CanvasProject,
    CanvasProjectRepositoryNotFound | CanvasProjectRepositoryUnavailable
  >;
  readonly list: () => Effect.Effect<
    ReadonlyArray<DomainCanvasProject.CanvasProject>,
    CanvasProjectRepositoryUnavailable
  >;
  readonly save: (
    canvasProject: DomainCanvasProject.CanvasProject
  ) => Effect.Effect<
    DomainCanvasProject.CanvasProject,
    CanvasProjectRepositoryNotFound | CanvasProjectRepositoryUnavailable
  >;
}

/**
 * CanvasProject repository service.
 *
 * @category repositories
 * @since 0.0.0
 */
export class CanvasProjectRepository extends Context.Service<CanvasProjectRepository, CanvasProjectRepositoryShape>()(
  $I`CanvasProjectRepository`
) {}
