/**
 * CanvasProject domain errors.
 *
 * @packageDocumentation
 * @category errors
 * @since 0.0.0
 */

import { $CanvasDomainId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

import { CanvasProjectId, CanvasProjectStatus } from "./CanvasProject.values.js";

const $I = $CanvasDomainId.create("aggregates/CanvasProject/CanvasProject.errors");

/**
 * Failure raised when a command attempts to mutate an archived CanvasProject.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasProjectAlreadyArchived extends TaggedErrorClass<CanvasProjectAlreadyArchived>(
  $I`CanvasProjectAlreadyArchived`
)(
  "CanvasProjectAlreadyArchived",
  {
    canvasProjectId: CanvasProjectId,
  },
  $I.annote("CanvasProjectAlreadyArchived", {
    title: "CanvasProject already archived",
    description: "The CanvasProject is archived and no further lifecycle transition is allowed.",
  })
) {}

/**
 * Failure raised when a command attempts an unsupported lifecycle transition.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasProjectInvalidTransition extends TaggedErrorClass<CanvasProjectInvalidTransition>(
  $I`CanvasProjectInvalidTransition`
)(
  "CanvasProjectInvalidTransition",
  {
    canvasProjectId: CanvasProjectId,
    from: CanvasProjectStatus,
    to: CanvasProjectStatus,
  },
  $I.annote("CanvasProjectInvalidTransition", {
    title: "CanvasProject invalid transition",
    description: "The requested lifecycle transition is not valid for the current CanvasProject state.",
  })
) {
  /**
   * Create a typed CanvasProject transition failure from lifecycle values.
   *
   * @category errors
   * @since 0.0.0
   */
  static fromStatus(input: {
    readonly canvasProjectId: CanvasProjectId;
    readonly from: CanvasProjectStatus;
    readonly to: CanvasProjectStatus;
  }) {
    return new CanvasProjectInvalidTransition({
      canvasProjectId: input.canvasProjectId,
      from: input.from,
      to: input.to,
    });
  }
}

/**
 * Failure raised when an assignment command omits a valid assignee.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasProjectAssigneeRequired extends TaggedErrorClass<CanvasProjectAssigneeRequired>(
  $I`CanvasProjectAssigneeRequired`
)(
  "CanvasProjectAssigneeRequired",
  {
    canvasProjectId: CanvasProjectId,
  },
  $I.annote("CanvasProjectAssigneeRequired", {
    title: "CanvasProject assignee required",
    description: "Assigning a CanvasProject requires a valid Worker identity.",
  })
) {}

/**
 * CanvasProject aggregate domain failure.
 *
 * @category errors
 * @since 0.0.0
 */
export type CanvasProjectDomainError =
  | CanvasProjectAlreadyArchived
  | CanvasProjectInvalidTransition
  | CanvasProjectAssigneeRequired;

/**
 * CanvasProject aggregate domain failure schema.
 *
 * @category errors
 * @since 0.0.0
 */
export const CanvasProjectDomainError = S.Union([
  CanvasProjectAlreadyArchived,
  CanvasProjectInvalidTransition,
  CanvasProjectAssigneeRequired,
]);
