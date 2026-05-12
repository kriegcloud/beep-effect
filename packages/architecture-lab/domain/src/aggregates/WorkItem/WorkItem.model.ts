/**
 * WorkItem aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.1.0
 */

import { $ArchitectureLabDomainId } from "@beep/identity/packages";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { WorkerId } from "../../entities/Worker/index.js";
import { defaultWorkPriority, WorkPriority } from "../../values/WorkPriority/index.js";
import { WorkItemAlreadyArchived, WorkItemAssigneeRequired, WorkItemInvalidTransition } from "./WorkItem.errors.js";
import { WorkItemId, WorkItemStatus, WorkItemTitle } from "./WorkItem.values.js";

const $I = $ArchitectureLabDomainId.create("aggregates/WorkItem/WorkItem.model");

/**
 * Architecture lab WorkItem aggregate.
 *
 * @category aggregates
 * @since 0.1.0
 */
export class WorkItem extends S.Class<WorkItem>($I`WorkItem`)(
  {
    id: WorkItemId,
    title: WorkItemTitle,
    status: WorkItemStatus,
    assignee: S.OptionFromOptionalKey(WorkerId),
    priority: S.OptionFromOptionalKey(WorkPriority),
  },
  $I.annote("WorkItem", {
    title: "WorkItem",
    description: "Canonical architecture lab aggregate used to prove slice topology.",
  })
) {}

/**
 * WorkItem creation input.
 *
 * @category aggregates
 * @since 0.1.0
 */
export class CreateWorkItemInput extends S.Class<CreateWorkItemInput>($I`CreateWorkItemInput`)(
  {
    id: WorkItemId,
    title: WorkItemTitle,
    priority: S.OptionFromOptionalKey(WorkPriority).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<WorkPriority>()))
    ),
  },
  $I.annote("CreateWorkItemInput", {
    title: "Create WorkItem input",
    description: "Input required to create an open architecture lab WorkItem.",
  })
) {}

/**
 * Create a new open WorkItem aggregate.
 *
 * @category aggregates
 * @since 0.1.0
 */
export const create = (input: CreateWorkItemInput): WorkItem =>
  new WorkItem({
    id: input.id,
    title: input.title,
    status: "open",
    assignee: O.none(),
    priority: O.some(O.getOrElse(input.priority, () => defaultWorkPriority)),
  });

const requireMutable = (workItem: WorkItem): Effect.Effect<void, WorkItemAlreadyArchived> =>
  workItem.status === "archived" ? Effect.fail(new WorkItemAlreadyArchived({ workItemId: workItem.id })) : Effect.void;

/**
 * Assign an open WorkItem to a concrete assignee.
 *
 * @category aggregates
 * @since 0.1.0
 */
export const assign = Effect.fn("WorkItem.assign")(function* (workItem: WorkItem, assignee: WorkerId) {
  yield* requireMutable(workItem);
  if (assignee <= 0) {
    return yield* new WorkItemAssigneeRequired({ workItemId: workItem.id });
  }
  if (workItem.status !== "open" && workItem.status !== "assigned") {
    return yield* WorkItemInvalidTransition.fromStatus({
      workItemId: workItem.id,
      from: workItem.status,
      to: "assigned",
    });
  }
  return new WorkItem({
    ...workItem,
    status: "assigned",
    assignee: O.some(assignee),
  });
});

/**
 * Complete an open or assigned WorkItem.
 *
 * @category aggregates
 * @since 0.1.0
 */
export const complete = Effect.fn("WorkItem.complete")(function* (workItem: WorkItem) {
  yield* requireMutable(workItem);
  if (workItem.status === "completed") {
    return workItem;
  }
  if (workItem.status !== "open" && workItem.status !== "assigned") {
    return yield* WorkItemInvalidTransition.fromStatus({
      workItemId: workItem.id,
      from: workItem.status,
      to: "completed",
    });
  }
  return new WorkItem({
    ...workItem,
    status: "completed",
  });
});

/**
 * Reopen a completed WorkItem.
 *
 * @category aggregates
 * @since 0.1.0
 */
export const reopen = Effect.fn("WorkItem.reopen")(function* (workItem: WorkItem) {
  yield* requireMutable(workItem);
  if (workItem.status !== "completed") {
    return yield* WorkItemInvalidTransition.fromStatus({ workItemId: workItem.id, from: workItem.status, to: "open" });
  }
  return new WorkItem({
    ...workItem,
    status: "open",
    assignee: O.none(),
  });
});

/**
 * Archive any non-archived WorkItem.
 *
 * @category aggregates
 * @since 0.1.0
 */
export const archive = Effect.fn("WorkItem.archive")(function* (workItem: WorkItem) {
  yield* requireMutable(workItem);
  return new WorkItem({
    ...workItem,
    status: "archived",
  });
});
