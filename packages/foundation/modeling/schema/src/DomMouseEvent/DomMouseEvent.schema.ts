/**
 * DOM schema helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("DomMouseEvent");

/**
 * Type guard for MouseEvent.
 *
 * @since 0.0.0
 * @category guards
 */
export const isMouseEvent = (u: unknown): u is MouseEvent => u instanceof MouseEvent;

/**
 * A DOM mouse event.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DOMMouseEvent = S.declare(isMouseEvent).pipe(
  $I.annoteSchema("DOMMouseEvent", {
    description: "A DOM mouse event",
  })
);

/**
 * Type for {@link DOMMouseEvent}.
 *
 * @since 0.0.0
 * @category models
 */
export type DOMMouseEvent = typeof DOMMouseEvent.Type;

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { DOMMouseEvent as DomMouseEvent, DOMMouseEvent as Schema };
