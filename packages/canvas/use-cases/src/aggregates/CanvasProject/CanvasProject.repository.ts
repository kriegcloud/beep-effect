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
import { Context } from "effect";
import * as S from "effect/Schema";
import type { Effect } from "effect";

const $I = $CanvasUseCasesId.create("aggregates/CanvasProject/CanvasProject.repository");

/**
 * Persistence failure raised when a CanvasProject row is absent.
 *
 * @example
 * ```ts
 * import { CanvasProjectRepositoryNotFound } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"
 *
 * console.log(CanvasProjectRepositoryNotFound)
 * ```
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
 * @example
 * ```ts
 * import { CanvasProjectRepositoryConflict } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"
 *
 * console.log(CanvasProjectRepositoryConflict)
 * ```
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
 * @example
 * ```ts
 * import { CanvasProjectRepositoryUnavailable } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"
 *
 * console.log(CanvasProjectRepositoryUnavailable)
 * ```
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
 * @example
 * ```ts
 * import type { CanvasProjectRepositoryError } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"
 *
 * const value = {} as CanvasProjectRepositoryError
 * console.log(value)
 * ```
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
 * @example
 * ```ts
 * import type { CanvasProjectRepositoryShape } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"
 *
 * const value = {} as CanvasProjectRepositoryShape
 * console.log(value)
 * ```
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
  readonly list: Effect.Effect<ReadonlyArray<DomainCanvasProject.CanvasProject>, CanvasProjectRepositoryUnavailable>;
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
 * @example
 * ```ts
 * import { CanvasProjectRepository } from "@beep/canvas-use-cases/aggregates/CanvasProject/server"
 *
 * console.log(CanvasProjectRepository)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class CanvasProjectRepository extends Context.Service<CanvasProjectRepository, CanvasProjectRepositoryShape>()(
  $I`CanvasProjectRepository`
) {}
