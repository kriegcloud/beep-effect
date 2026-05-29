/**
 * CanvasProject use-case service.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $CanvasUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import type * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import type { Effect } from "effect";
import type {
  AddCanvasNodeCommand,
  ArchiveCanvasProjectCommand,
  CreateCanvasProjectCommand,
  GetCanvasProjectQuery,
  ListCanvasProjectsQuery,
  RemoveCanvasNodeCommand,
  RestoreCanvasProjectCommand,
} from "./CanvasProject.commands.js";
import type { CanvasProjectActionError } from "./CanvasProject.errors.js";

const $I = $CanvasUseCasesId.create("aggregates/CanvasProject/CanvasProject.use-cases");

/**
 * Public CanvasProject use-case contract.
 *
 * @example
 * ```ts
 * import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"
 *
 * declare const useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape
 * const restore = useCases.restore
 * console.log(typeof restore)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export interface CanvasProjectUseCasesShape {
  readonly addNode: (
    command: AddCanvasNodeCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly archive: (
    command: ArchiveCanvasProjectCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly create: (
    command: CreateCanvasProjectCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly get: (
    query: GetCanvasProjectQuery
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly list: (
    query: ListCanvasProjectsQuery
  ) => Effect.Effect<ReadonlyArray<DomainCanvasProject.CanvasProject>, CanvasProjectActionError>;
  readonly removeNode: (
    command: RemoveCanvasNodeCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
  readonly restore: (
    command: RestoreCanvasProjectCommand
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError>;
}

/**
 * Public CanvasProject use-case service.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-use-cases/public"
 *
 * console.log(CanvasProject.CanvasProjectUseCases)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class CanvasProjectUseCases extends Context.Service<CanvasProjectUseCases, CanvasProjectUseCasesShape>()(
  $I`CanvasProjectUseCases`
) {}
