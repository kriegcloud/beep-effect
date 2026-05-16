/**
 * CanvasProject aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

import { $CanvasDomainId } from "@beep/identity/packages";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { WorkerId } from "../../entities/Worker/index.js";
import { defaultWorkPriority, WorkPriority } from "../../values/WorkPriority/index.js";
import {
  CanvasProjectAlreadyArchived,
  CanvasProjectAssigneeRequired,
  CanvasProjectInvalidTransition,
} from "./CanvasProject.errors.js";
import { CanvasProjectId, CanvasProjectStatus, CanvasProjectTitle } from "./CanvasProject.values.js";

const $I = $CanvasDomainId.create("aggregates/CanvasProject/CanvasProject.model");

/**
 * Architecture lab CanvasProject aggregate.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class CanvasProject extends S.Class<CanvasProject>($I`CanvasProject`)(
  {
    id: CanvasProjectId,
    title: CanvasProjectTitle,
    status: CanvasProjectStatus,
    assignee: S.OptionFromOptionalKey(WorkerId),
    priority: S.OptionFromOptionalKey(WorkPriority),
  },
  $I.annote("CanvasProject", {
    title: "CanvasProject",
    description: "Canonical canvas aggregate used to prove slice topology.",
  })
) {}

/**
 * CanvasProject creation input.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class CreateCanvasProjectInput extends S.Class<CreateCanvasProjectInput>($I`CreateCanvasProjectInput`)(
  {
    id: CanvasProjectId,
    title: CanvasProjectTitle,
    priority: S.OptionFromOptionalKey(WorkPriority).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<WorkPriority>()))
    ),
  },
  $I.annote("CreateCanvasProjectInput", {
    title: "Create CanvasProject input",
    description: "Input required to create an open canvas CanvasProject.",
  })
) {}

/**
 * Create a new open CanvasProject aggregate.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const create = (input: CreateCanvasProjectInput): CanvasProject =>
  new CanvasProject({
    id: input.id,
    title: input.title,
    status: "open",
    assignee: O.none(),
    priority: O.some(O.getOrElse(input.priority, () => defaultWorkPriority)),
  });

const requireMutable = (canvasProject: CanvasProject): Effect.Effect<void, CanvasProjectAlreadyArchived> =>
  canvasProject.status === "archived"
    ? Effect.fail(new CanvasProjectAlreadyArchived({ canvasProjectId: canvasProject.id }))
    : Effect.void;

/**
 * Assign an open CanvasProject to a concrete assignee.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const assign = Effect.fn("CanvasProject.assign")(function* (canvasProject: CanvasProject, assignee: WorkerId) {
  yield* requireMutable(canvasProject);
  if (assignee <= 0) {
    return yield* new CanvasProjectAssigneeRequired({ canvasProjectId: canvasProject.id });
  }
  if (canvasProject.status !== "open" && canvasProject.status !== "assigned") {
    return yield* CanvasProjectInvalidTransition.fromStatus({
      canvasProjectId: canvasProject.id,
      from: canvasProject.status,
      to: "assigned",
    });
  }
  return new CanvasProject({
    ...canvasProject,
    status: "assigned",
    assignee: O.some(assignee),
  });
});

/**
 * Complete an open or assigned CanvasProject.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const complete = Effect.fn("CanvasProject.complete")(function* (canvasProject: CanvasProject) {
  yield* requireMutable(canvasProject);
  if (canvasProject.status === "completed") {
    return canvasProject;
  }
  if (canvasProject.status !== "open" && canvasProject.status !== "assigned") {
    return yield* CanvasProjectInvalidTransition.fromStatus({
      canvasProjectId: canvasProject.id,
      from: canvasProject.status,
      to: "completed",
    });
  }
  return new CanvasProject({
    ...canvasProject,
    status: "completed",
  });
});

/**
 * Reopen a completed CanvasProject.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const reopen = Effect.fn("CanvasProject.reopen")(function* (canvasProject: CanvasProject) {
  yield* requireMutable(canvasProject);
  if (canvasProject.status !== "completed") {
    return yield* CanvasProjectInvalidTransition.fromStatus({
      canvasProjectId: canvasProject.id,
      from: canvasProject.status,
      to: "open",
    });
  }
  return new CanvasProject({
    ...canvasProject,
    status: "open",
    assignee: O.none(),
  });
});

/**
 * Archive any non-archived CanvasProject.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const archive = Effect.fn("CanvasProject.archive")(function* (canvasProject: CanvasProject) {
  yield* requireMutable(canvasProject);
  return new CanvasProject({
    ...canvasProject,
    status: "archived",
  });
});
