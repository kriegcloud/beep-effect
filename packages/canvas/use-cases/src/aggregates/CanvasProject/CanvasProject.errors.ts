/**
 * CanvasProject use-case errors.
 *
 * @packageDocumentation
 * @category errors
 * @since 0.0.0
 */

import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { $CanvasUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Match } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $CanvasUseCasesId.create("aggregates/CanvasProject/CanvasProject.errors");

/**
 * Generic public reason used when internal CanvasProject repository details are redacted.
 *
 * @category errors
 * @since 0.0.0
 */
export const CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON = "CanvasProject service is unavailable." as const;

/**
 * Generic public reason used when internal CanvasProject conflict details are redacted.
 *
 * @category errors
 * @since 0.0.0
 */
export const CANVAS_PROJECT_CONFLICT_REASON = "CanvasProject already exists." as const;

/**
 * Public failure raised when a requested CanvasProject is absent.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasProjectNotFound extends TaggedErrorClass<CanvasProjectNotFound>($I`CanvasProjectNotFound`)(
  "CanvasProjectNotFound",
  {
    canvasProjectId: DomainCanvasProject.CanvasProjectId,
  },
  $I.annote("CanvasProjectNotFound", {
    title: "CanvasProject not found",
    description: "The requested canvas CanvasProject does not exist.",
  })
) {
  static readonly new = (canvasProjectId: DomainCanvasProject.CanvasProjectId): CanvasProjectNotFound =>
    CanvasProjectNotFound.make({ canvasProjectId });
}

/**
 * Public failure raised when a command conflicts with persisted state.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasProjectConflict extends TaggedErrorClass<CanvasProjectConflict>($I`CanvasProjectConflict`)(
  "CanvasProjectConflict",
  {
    canvasProjectId: DomainCanvasProject.CanvasProjectId,
    reason: S.String,
  },
  $I.annote("CanvasProjectConflict", {
    title: "CanvasProject conflict",
    description: "The requested CanvasProject command conflicts with persisted state.",
  })
) {
  static readonly new: {
    (errorOrId: CanvasProjectConflict | DomainCanvasProject.CanvasProjectId, reason: string): CanvasProjectConflict;
    (reason: string): (errorOrId: CanvasProjectConflict | DomainCanvasProject.CanvasProjectId) => CanvasProjectConflict;
  } = dual(
    2,
    (errorOrId: DomainCanvasProject.CanvasProjectId, reason: string): CanvasProjectConflict =>
      Match.value(errorOrId).pipe(
        Match.when(S.is(DomainCanvasProject.CanvasProjectId), (canvasProjectId) =>
          CanvasProjectConflict.make({
            canvasProjectId,
            reason,
          })
        ),
        Match.when(S.is(CanvasProjectConflict), (errorOrId) =>
          CanvasProjectConflict.make({
            canvasProjectId: errorOrId.canvasProjectId,
            reason,
          })
        ),
        Match.orElseAbsurd
      )
  );
}

/**
 * Public failure raised when the domain rejects a CanvasProject action.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasProjectActionRejected extends TaggedErrorClass<CanvasProjectActionRejected>(
  $I`CanvasProjectActionRejected`
)(
  "CanvasProjectActionRejected",
  {
    canvasProjectId: DomainCanvasProject.CanvasProjectId,
    reason: S.String,
  },
  $I.annote("CanvasProjectActionRejected", {
    title: "CanvasProject action rejected",
    description: "The CanvasProject aggregate rejected the requested action.",
  })
) {}

/**
 * Public failure raised when an action cannot be completed.
 *
 * @category errors
 * @since 0.0.0
 */
export class CanvasProjectActionFailed extends TaggedErrorClass<CanvasProjectActionFailed>(
  $I`CanvasProjectActionFailed`
)(
  "CanvasProjectActionFailed",
  {
    reason: S.String,
  },
  $I.annote("CanvasProjectActionFailed", {
    title: "CanvasProject action failed",
    description: "The CanvasProject use-case action could not be completed.",
  })
) {}

/**
 * Public CanvasProject use-case failure.
 *
 * @category errors
 * @since 0.0.0
 */
export type CanvasProjectActionError =
  | CanvasProjectNotFound
  | CanvasProjectConflict
  | CanvasProjectActionRejected
  | CanvasProjectActionFailed;

/**
 * Public CanvasProject use-case failure schema.
 *
 * @category errors
 * @since 0.0.0
 */
export const CanvasProjectActionError = S.Union([
  CanvasProjectNotFound,
  CanvasProjectConflict,
  CanvasProjectActionRejected,
  CanvasProjectActionFailed,
]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("CanvasProjectActionError", {
    description: "Public CanvasProject use-case failure.",
  })
);
