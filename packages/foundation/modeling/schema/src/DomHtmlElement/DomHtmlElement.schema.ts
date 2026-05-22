/**
 * DOM schema helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("DomHtmlElement");

/**
 * Type guard for HTMLElement.
 *
 * @since 0.0.0
 * @category guards
 */
export const isHTMLElement = (u: unknown): u is HTMLElement => u instanceof HTMLElement;

/**
 * An HTMLElement.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DOMHtmlElement = S.declare(isHTMLElement).pipe(
  $I.annoteSchema("DOMHtmlElement", {
    description: "An HTMLElement",
  })
);

/**
 * Type for {@link DOMHtmlElement}.
 *
 * @since 0.0.0
 * @category models
 */
export type DOMHtmlElement = typeof DOMHtmlElement.Type;

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { DOMHtmlElement as DomHtmlElement, DOMHtmlElement as Schema };
