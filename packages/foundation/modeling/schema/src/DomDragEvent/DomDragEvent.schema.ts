/**
 * DOM schema helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("DomDragEvent");

/**
 * Type guard for DragEvent.
 *
 * @since 0.0.0
 * @category guards
 */
export const isDragEvent = (u: unknown): u is DragEvent => u instanceof DragEvent;

/**
 * A DragEvent.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DOMDragEvent = S.declare(isDragEvent).pipe(
  $I.annoteSchema("DOMDragEvent", {
    description: "A DragEvent",
  })
);

/**
 * Type for {@link DOMDragEvent}.
 *
 * @since 0.0.0
 * @category models
 */
export type DOMDragEvent = typeof DOMDragEvent.Type;

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { DOMDragEvent as DomDragEvent, DOMDragEvent as Schema };
