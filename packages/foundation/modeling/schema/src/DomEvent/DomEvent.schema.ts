/**
 * DOM schema helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("DomEvent");

/**
 * Type guard for Event.
 *
 * @since 0.0.0
 * @category guards
 */
export const isEvent = (u: unknown): u is Event => u instanceof Event;

/**
 * A DOM event.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DOMEvent = S.declare(isEvent).pipe(
  $I.annoteSchema("DOMEvent", {
    description: "A DOM event",
  })
);

/**
 * Type for {@link DOMEvent}.
 *
 * @since 0.0.0
 * @category models
 */
export type DOMEvent = typeof DOMEvent.Type;

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { DOMEvent as DomEvent, DOMEvent as Schema };
