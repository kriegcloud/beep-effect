/**
 * CanvasProject value objects.
 *
 * @packageDocumentation
 * @category value-objects
 * @since 0.0.0
 */

import { $CanvasDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $CanvasDomainId.create("aggregates/CanvasProject/CanvasProject.values");

/**
 * Architecture lab CanvasProject identity.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasProjectId = S.String.pipe(
  S.brand("CanvasCanvasProjectId"),
  $I.annoteSchema("CanvasProjectId", {
    identifier: "CanvasProjectId",
    title: "CanvasProject ID",
    description: "Stable identifier for the canonical canvas CanvasProject aggregate.",
  })
);

/**
 * Architecture lab CanvasProject identity type.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasProjectId = S.Schema.Type<typeof CanvasProjectId>;

/**
 * Architecture lab CanvasProject title.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasProjectTitle = S.String.pipe(
  $I.annoteSchema("CanvasProjectTitle", {
    identifier: "CanvasProjectTitle",
    title: "CanvasProject title",
    description: "Human-readable CanvasProject title.",
  })
);

/**
 * Architecture lab CanvasProject title type.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasProjectTitle = S.Schema.Type<typeof CanvasProjectTitle>;

/**
 * Architecture lab CanvasProject lifecycle values.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasProjectStatus = LiteralKit(["open", "assigned", "completed", "archived"] as const).pipe(
  $I.annoteSchema("CanvasProjectStatus", {
    title: "CanvasProject status",
    description: "Canonical lifecycle status for the canvas CanvasProject aggregate.",
  })
);

/**
 * Architecture lab CanvasProject lifecycle value.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasProjectStatus = typeof CanvasProjectStatus.Type;
