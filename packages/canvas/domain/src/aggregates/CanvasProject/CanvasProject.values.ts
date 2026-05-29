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
 * CanvasProject identity.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasProjectId = S.String.pipe(
  S.brand("CanvasProjectId"),
  $I.annoteSchema("CanvasProjectId", {
    identifier: "CanvasProjectId",
    title: "CanvasProject ID",
    description: "Stable identifier for a canvas scene container.",
  })
);

/**
 * CanvasProject identity type.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasProjectId = typeof CanvasProjectId.Type;

/**
 * CanvasProject title.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasProjectTitle = S.NonEmptyString.pipe(
  $I.annoteSchema("CanvasProjectTitle", {
    identifier: "CanvasProjectTitle",
    title: "CanvasProject title",
    description: "Human-readable canvas scene title.",
  })
);

/**
 * CanvasProject title type.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasProjectTitle = typeof CanvasProjectTitle.Type;

/**
 * CanvasProject lifecycle values.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasProjectStatus = LiteralKit(["open", "archived"]).pipe(
  $I.annoteSchema("CanvasProjectStatus", {
    title: "CanvasProject status",
    description: "Lifecycle status for the bootstrap canvas scene container.",
  })
);

/**
 * CanvasProject lifecycle value.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasProjectStatus = typeof CanvasProjectStatus.Type;

/**
 * CanvasNode identity.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasNodeId = S.String.pipe(
  S.brand("CanvasNodeId"),
  $I.annoteSchema("CanvasNodeId", {
    identifier: "CanvasNodeId",
    title: "CanvasNode ID",
    description: "Stable identifier for a lightweight canvas node metadata entry.",
  })
);

/**
 * CanvasNode identity type.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasNodeId = typeof CanvasNodeId.Type;

/**
 * Bootstrap CanvasNode kinds.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasNodeKind = LiteralKit(["note", "shape", "asset"]).pipe(
  $I.annoteSchema("CanvasNodeKind", {
    title: "CanvasNode kind",
    description: "Small bootstrap node metadata vocabulary for canvas scenes.",
  })
);

/**
 * Bootstrap CanvasNode kind.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasNodeKind = typeof CanvasNodeKind.Type;

/**
 * CanvasNode label.
 *
 * @category value-objects
 * @since 0.0.0
 */
export const CanvasNodeLabel = S.NonEmptyString.pipe(
  $I.annoteSchema("CanvasNodeLabel", {
    identifier: "CanvasNodeLabel",
    title: "CanvasNode label",
    description: "Human-readable label for a bootstrap canvas node metadata entry.",
  })
);

/**
 * CanvasNode label type.
 *
 * @category value-objects
 * @since 0.0.0
 */
export type CanvasNodeLabel = typeof CanvasNodeLabel.Type;
