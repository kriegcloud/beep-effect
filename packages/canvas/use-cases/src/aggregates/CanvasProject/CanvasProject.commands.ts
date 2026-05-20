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
 * Archive CanvasProject command.
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
