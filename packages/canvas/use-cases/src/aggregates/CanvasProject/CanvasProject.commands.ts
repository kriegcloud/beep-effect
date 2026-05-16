/**
 * CanvasProject commands and queries.
 *
 * @packageDocumentation
 * @category commands
 * @since 0.0.0
 */

import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import * as DomainWorker from "@beep/canvas-domain/entities/Worker";
import * as DomainWorkPriority from "@beep/canvas-domain/values/WorkPriority";
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
    priority: S.OptionFromOptionalKey(DomainWorkPriority.WorkPriority).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<DomainWorkPriority.WorkPriority>()))
    ),
  },
  $I.annote("CreateCanvasProjectCommand", {
    title: "Create CanvasProject command",
    description: "Public command for creating a canonical canvas CanvasProject.",
  })
) {}

/**
 * Assign CanvasProject command.
 *
 * @category commands
 * @since 0.0.0
 */
export class AssignCanvasProjectCommand extends S.Class<AssignCanvasProjectCommand>($I`AssignCanvasProjectCommand`)(
  {
    id: DomainCanvasProject.CanvasProjectId,
    assignee: DomainWorker.WorkerId,
  },
  $I.annote("AssignCanvasProjectCommand", {
    title: "Assign CanvasProject command",
    description: "Public command for assigning a canonical canvas CanvasProject.",
  })
) {}

/**
 * Complete CanvasProject command.
 *
 * @category commands
 * @since 0.0.0
 */
export class CompleteCanvasProjectCommand extends S.Class<CompleteCanvasProjectCommand>(
  $I`CompleteCanvasProjectCommand`
)(
  {
    id: DomainCanvasProject.CanvasProjectId,
  },
  $I.annote("CompleteCanvasProjectCommand", {
    title: "Complete CanvasProject command",
    description: "Public command for completing a canonical canvas CanvasProject.",
  })
) {}

/**
 * Reopen CanvasProject command.
 *
 * @category commands
 * @since 0.0.0
 */
export class ReopenCanvasProjectCommand extends S.Class<ReopenCanvasProjectCommand>($I`ReopenCanvasProjectCommand`)(
  {
    id: DomainCanvasProject.CanvasProjectId,
  },
  $I.annote("ReopenCanvasProjectCommand", {
    title: "Reopen CanvasProject command",
    description: "Public command for reopening a completed canonical canvas CanvasProject.",
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
    description: "Public command for archiving a canonical canvas CanvasProject.",
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
    description: "Public query for loading one canonical canvas CanvasProject.",
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
    description: "Public query for listing canonical canvas CanvasProjects.",
  })
) {}
