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

import { CanvasNodeId, CanvasProjectId, CanvasProjectStatus } from "./CanvasProject.values.js";

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
 * Failure raised when a CanvasNode id is already present in a CanvasProject.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasNodeAlreadyExists extends TaggedErrorClass<CanvasNodeAlreadyExists>($I`CanvasNodeAlreadyExists`)(
  "CanvasNodeAlreadyExists",
  {
    canvasProjectId: CanvasProjectId,
    canvasNodeId: CanvasNodeId,
  },
  $I.annote("CanvasNodeAlreadyExists", {
    title: "CanvasNode already exists",
    description: "A CanvasProject already contains the requested CanvasNode id.",
  })
) {}

/**
 * Failure raised when a CanvasNode id is absent from a CanvasProject.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasNodeNotFound extends TaggedErrorClass<CanvasNodeNotFound>($I`CanvasNodeNotFound`)(
  "CanvasNodeNotFound",
  {
    canvasProjectId: CanvasProjectId,
    canvasNodeId: CanvasNodeId,
  },
  $I.annote("CanvasNodeNotFound", {
    title: "CanvasNode not found",
    description: "A CanvasProject does not contain the requested CanvasNode id.",
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
  | CanvasNodeAlreadyExists
  | CanvasNodeNotFound;

/**
 * CanvasProject aggregate domain failure schema.
 *
 * @category errors
 * @since 0.0.0
 */
export const CanvasProjectDomainError = S.Union([
  CanvasProjectAlreadyArchived,
  CanvasProjectInvalidTransition,
  CanvasNodeAlreadyExists,
  CanvasNodeNotFound,
]);
