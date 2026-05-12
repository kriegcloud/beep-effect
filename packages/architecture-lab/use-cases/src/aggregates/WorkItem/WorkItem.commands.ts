/**
 * WorkItem commands and queries.
 *
 * @packageDocumentation
 * @category commands
 * @since 0.1.0
 */

import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $ArchitectureLabUseCasesId.create("aggregates/WorkItem/WorkItem.commands");

/**
 * Create WorkItem command.
 *
 * @category commands
 * @since 0.1.0
 */
export class CreateWorkItemCommand extends S.Class<CreateWorkItemCommand>($I`CreateWorkItemCommand`)(
  {
    id: DomainWorkItem.WorkItemId,
    title: DomainWorkItem.WorkItemTitle,
  },
  $I.annote("CreateWorkItemCommand", {
    title: "Create WorkItem command",
    description: "Public command for creating a canonical architecture lab WorkItem.",
  })
) {}

/**
 * Assign WorkItem command.
 *
 * @category commands
 * @since 0.1.0
 */
export class AssignWorkItemCommand extends S.Class<AssignWorkItemCommand>($I`AssignWorkItemCommand`)(
  {
    id: DomainWorkItem.WorkItemId,
    assignee: S.String,
  },
  $I.annote("AssignWorkItemCommand", {
    title: "Assign WorkItem command",
    description: "Public command for assigning a canonical architecture lab WorkItem.",
  })
) {}

/**
 * Complete WorkItem command.
 *
 * @category commands
 * @since 0.1.0
 */
export class CompleteWorkItemCommand extends S.Class<CompleteWorkItemCommand>($I`CompleteWorkItemCommand`)(
  {
    id: DomainWorkItem.WorkItemId,
  },
  $I.annote("CompleteWorkItemCommand", {
    title: "Complete WorkItem command",
    description: "Public command for completing a canonical architecture lab WorkItem.",
  })
) {}

/**
 * Reopen WorkItem command.
 *
 * @category commands
 * @since 0.1.0
 */
export class ReopenWorkItemCommand extends S.Class<ReopenWorkItemCommand>($I`ReopenWorkItemCommand`)(
  {
    id: DomainWorkItem.WorkItemId,
  },
  $I.annote("ReopenWorkItemCommand", {
    title: "Reopen WorkItem command",
    description: "Public command for reopening a completed canonical architecture lab WorkItem.",
  })
) {}

/**
 * Archive WorkItem command.
 *
 * @category commands
 * @since 0.1.0
 */
export class ArchiveWorkItemCommand extends S.Class<ArchiveWorkItemCommand>($I`ArchiveWorkItemCommand`)(
  {
    id: DomainWorkItem.WorkItemId,
  },
  $I.annote("ArchiveWorkItemCommand", {
    title: "Archive WorkItem command",
    description: "Public command for archiving a canonical architecture lab WorkItem.",
  })
) {}

/**
 * Get WorkItem query.
 *
 * @category commands
 * @since 0.1.0
 */
export class GetWorkItemQuery extends S.Class<GetWorkItemQuery>($I`GetWorkItemQuery`)(
  {
    id: DomainWorkItem.WorkItemId,
  },
  $I.annote("GetWorkItemQuery", {
    title: "Get WorkItem query",
    description: "Public query for loading one canonical architecture lab WorkItem.",
  })
) {}

/**
 * List WorkItems query.
 *
 * @category commands
 * @since 0.1.0
 */
export class ListWorkItemsQuery extends S.Class<ListWorkItemsQuery>($I`ListWorkItemsQuery`)(
  {
    status: S.OptionFromOptionalKey(DomainWorkItem.WorkItemStatus),
  },
  $I.annote("ListWorkItemsQuery", {
    title: "List WorkItems query",
    description: "Public query for listing canonical architecture lab WorkItems.",
  })
) {}
