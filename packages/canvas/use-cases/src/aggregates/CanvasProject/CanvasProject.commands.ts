/**
 * CanvasProject commands and queries.
 *
 * @packageDocumentation
 * @category commands
 * @since 0.0.0
 */

import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { $CanvasUseCasesId } from "@beep/identity/packages";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $CanvasUseCasesId.create("aggregates/CanvasProject/CanvasProject.commands");

/**
 * Create CanvasProject command.
 *
 * @example
 * ```ts
 * import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
 * import { CanvasProject } from "@beep/canvas-use-cases/public"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const commandEffect = Effect.gen(function* () {
 *   const id = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1")
 *   const title = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectTitle)("Scene 1")
 *   return new CanvasProject.CreateCanvasProjectCommand({ id, title })
 * })
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class CreateCanvasProjectCommand extends S.Class<CreateCanvasProjectCommand>($I`CreateCanvasProjectCommand`)(
  {
    id: DomainCanvasProject.CanvasProjectId,
    title: DomainCanvasProject.CanvasProjectTitle,
  },
  $I.annote("CreateCanvasProjectCommand", {
    title: "Create CanvasProject command",
    description: "Public command for creating a bootstrap canvas scene container.",
  })
) {}

/**
 * Restore CanvasProject command.
 *
 * @example
 * ```ts
 * import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
 * import { CanvasProject } from "@beep/canvas-use-cases/public"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const commandEffect = Effect.gen(function* () {
 *   const id = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1")
 *   const title = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectTitle)("Scene 1")
 *   const scene = new DomainCanvasProject.CanvasProject({ id, title, status: "open", nodes: [] })
 *   return new CanvasProject.RestoreCanvasProjectCommand({ scene })
 * })
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class RestoreCanvasProjectCommand extends S.Class<RestoreCanvasProjectCommand>($I`RestoreCanvasProjectCommand`)(
  {
    scene: DomainCanvasProject.CanvasProject,
  },
  $I.annote("RestoreCanvasProjectCommand", {
    title: "Restore CanvasProject command",
    description: "Public command for replacing or importing a bootstrap canvas scene container.",
  })
) {}

/**
 * Archive CanvasProject command.
 *
 * @example
 * ```ts
 * import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
 * import { CanvasProject } from "@beep/canvas-use-cases/public"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const commandEffect = S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1").pipe(
 *   Effect.map((id) => new CanvasProject.ArchiveCanvasProjectCommand({ id }))
 * )
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class ArchiveCanvasProjectCommand extends S.Class<ArchiveCanvasProjectCommand>($I`ArchiveCanvasProjectCommand`)(
  {
    id: DomainCanvasProject.CanvasProjectId,
  },
  $I.annote("ArchiveCanvasProjectCommand", {
    title: "Archive CanvasProject command",
    description: "Public command for archiving a bootstrap canvas scene container.",
  })
) {}

/**
 * Add CanvasNode command.
 *
 * @example
 * ```ts
 * import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
 * import { CanvasProject } from "@beep/canvas-use-cases/public"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const commandEffect = Effect.gen(function* () {
 *   const id = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1")
 *   const nodeId = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeId)("node-1")
 *   const label = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeLabel)("Opening note")
 *   const node = new DomainCanvasProject.CanvasNode({ id: nodeId, kind: "note", label })
 *   return new CanvasProject.AddCanvasNodeCommand({ id, node })
 * })
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class AddCanvasNodeCommand extends S.Class<AddCanvasNodeCommand>($I`AddCanvasNodeCommand`)(
  {
    id: DomainCanvasProject.CanvasProjectId,
    node: DomainCanvasProject.CanvasNode,
  },
  $I.annote("AddCanvasNodeCommand", {
    title: "Add CanvasNode command",
    description: "Public command for adding lightweight node metadata to a canvas scene.",
  })
) {}

/**
 * Remove CanvasNode command.
 *
 * @example
 * ```ts
 * import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
 * import { CanvasProject } from "@beep/canvas-use-cases/public"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const commandEffect = Effect.gen(function* () {
 *   const id = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1")
 *   const nodeId = yield* S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeId)("node-1")
 *   return new CanvasProject.RemoveCanvasNodeCommand({ id, nodeId })
 * })
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class RemoveCanvasNodeCommand extends S.Class<RemoveCanvasNodeCommand>($I`RemoveCanvasNodeCommand`)(
  {
    id: DomainCanvasProject.CanvasProjectId,
    nodeId: DomainCanvasProject.CanvasNodeId,
  },
  $I.annote("RemoveCanvasNodeCommand", {
    title: "Remove CanvasNode command",
    description: "Public command for removing lightweight node metadata from a canvas scene.",
  })
) {}

/**
 * Get CanvasProject query.
 *
 * @example
 * ```ts
 * import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject"
 * import { CanvasProject } from "@beep/canvas-use-cases/public"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const queryEffect = S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId)("scene-1").pipe(
 *   Effect.map((id) => new CanvasProject.GetCanvasProjectQuery({ id }))
 * )
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class GetCanvasProjectQuery extends S.Class<GetCanvasProjectQuery>($I`GetCanvasProjectQuery`)(
  {
    id: DomainCanvasProject.CanvasProjectId,
  },
  $I.annote("GetCanvasProjectQuery", {
    title: "Get CanvasProject query",
    description: "Public query for loading one bootstrap canvas scene container.",
  })
) {}

/**
 * List CanvasProjects query.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-use-cases/public"
 *
 * const query = new CanvasProject.ListCanvasProjectsQuery({})
 * ```
 *
 * @category commands
 * @since 0.0.0
 */
export class ListCanvasProjectsQuery extends S.Class<ListCanvasProjectsQuery>($I`ListCanvasProjectsQuery`)(
  {
    status: S.OptionFromOptionalKey(DomainCanvasProject.CanvasProjectStatus).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<DomainCanvasProject.CanvasProjectStatus>()))
    ),
  },
  $I.annote("ListCanvasProjectsQuery", {
    title: "List CanvasProjects query",
    description: "Public query for listing bootstrap canvas scene containers.",
  })
) {}
