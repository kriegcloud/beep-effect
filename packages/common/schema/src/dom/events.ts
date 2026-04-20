/**
 * DOM event schemas
 *
 * @since	0.0.0
 * @module \@beep/schema/dom/events
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("dom/events");

/**
 * Type guard for Event
 *
 * @since 0.0.0
 * @category guards
 * @param u - Value to test.
 * @returns Whether the value is an `Event`.
 */
export const isEvent = (u: unknown): u is Event => u instanceof Event;

/**
 * Type guard for MouseEvent
 *
 * @since 0.0.0
 * @category guards
 * @param u - Value to test.
 * @returns Whether the value is a `MouseEvent`.
 */
export const isMouseEvent = (u: unknown): u is MouseEvent => u instanceof MouseEvent;

/**
 * A DOM event
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const DOMEvent = S.declare(isEvent).pipe(
  $I.annoteSchema("DOMEvent", {
    description: "A DOM event",
  })
);

/**
 * {@inheritDoc DOMEvent}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DOMEvent = typeof DOMEvent.Type;

/**
 * A DOM mouse event
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const DOMMouseEvent = S.declare(isMouseEvent).pipe(
  $I.annoteSchema("DOMMouseEvent", {
    description: "A DOM mouse event",
  })
);

/**
 * {@inheritDoc DOMMouseEvent}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DOMMouseEvent = typeof DOMMouseEvent.Type;
