/**
 * DOM element schemas
 *
 * @module \@beep/schema/dom/elements
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { A, P } from "@beep/utils";
import * as S from "effect/Schema";
import type * as React from "react";

const $I = $SchemaId.create("dom/elements");

/**
 * Type guard for HTMLElement
 *
 * @since 0.0.0
 * @category Validation
 * @param u - Value to test.
 * @returns `true` when the value is an `HTMLElement`.
 */
export const isHTMLElement = (u: unknown): u is HTMLElement => u instanceof HTMLElement;

/**
 * An HTMLElement
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DOMHtmlElement = S.declare(isHTMLElement).pipe(
  $I.annoteSchema("DOMHtmlElement", {
    description: "An HTMLElement",
  })
);

/**
 * {@inheritDoc HTMLElement}
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DOMHtmlElement = typeof DOMHtmlElement.Type;

/**
 * Type guard for React.CSSProperties
 *
 * @since 0.0.0
 * @category Validation
 * @param u - Value to test.
 * @returns `true` when the value is a `React.CSSProperties` object.
 */
export const isCSSProperties = (u: unknown): u is React.CSSProperties => {
  if (P.not(P.isObject)(u) || P.isNull(u)) {
    return false;
  }
  // CSSProperties is a plain object with CSS property names as keys
  // We check if it's an object and not an array or other type
  return !A.isArray(u) && Object.prototype.toString.call(u) === "[object Object]";
};

/**
 * A React.CSSProperties
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DOMCssProperties = S.declare(isCSSProperties).pipe(
  $I.annoteSchema("DOMCssProperties", {
    description: "A React.CSSProperties",
  })
);

/**
 * Type guard for React.ReactNode
 *
 * @since 0.0.0
 * @category Validation
 * @param u - Value to test.
 * @returns `true` when the value is a valid `React.ReactNode`.
 */
export const isReactNode = (u: unknown): u is React.ReactNode => {
  // React.ReactNode can be:
  // - string, number, boolean (primitives)
  // - null or undefined
  // - ReactElement (object with $$typeof property)
  // - Iterable<ReactNode> (arrays)
  // - ReactPortal

  if (u === null || u === undefined) {
    return true;
  }

  const typeofU = typeof u;

  // Primitive types
  if (typeofU === "string" || typeofU === "number" || typeofU === "boolean") {
    return true;
  }

  // Arrays (Iterable)
  if (A.isArray(u)) {
    return u.every(isReactNode);
  }

  // React elements and portals (objects with $$typeof)
  if (P.isObject(u) && !P.isNull(u)) {
    return true;
  }

  return false;
};

/**
 * A React.ReactNode
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DOMReactNode = S.declare(isReactNode).pipe(
  $I.annoteSchema("DOMReactNode", {
    description: "A React.ReactNode",
  })
);

/**
 * {@inheritDoc DOMReactNode}
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DOMReactNode = typeof DOMReactNode.Type;

/**
 * Type guard for React.Ref<T>
 *
 * @since 0.0.0
 * @category Validation
 * @param u - Value to test.
 * @returns `true` when the value is a valid `React.Ref<T>`.
 */
export const isReactRef = <T>(u: unknown): u is React.Ref<T> => {
  // React.Ref can be:
  // - null or undefined
  // - a callback function
  // - an object with 'current' property (RefObject)
  // - a string (legacy string refs, but we'll include for completeness)

  if (u === null || u === undefined) {
    return true;
  }

  const typeofU = typeof u;

  // Callback ref (function)
  if (typeofU === "function") {
    return true;
  }

  // String ref (legacy)
  if (typeofU === "string") {
    return true;
  }

  // RefObject (object with current property)
  return P.isObject(u) && !P.isNull(u) && "current" in u;
};

/**
 * Creates a Schema for React.Ref<T> where T extends HTMLElement
 *
 * @since 0.0.0
 * @category DomainModel
 * @returns A Schema for React.Ref<T>
 */
export const createDOMRefSchema = <T extends HTMLElement>() => {
  return S.declare(isReactRef<T>).pipe(
    $I.annoteSchema("DOMRef", {
      description: "A React.Ref for an HTMLElement",
    })
  );
};

/**
 * Type guard for DragEvent
 *
 * @since 0.0.0
 * @category Validation
 * @param u - Value to test.
 * @returns `true` when the value is a `DragEvent`.
 */
export const isDragEvent = (u: unknown): u is DragEvent => u instanceof DragEvent;

/**
 * A DragEvent
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const DOMDragEvent = S.declare(isDragEvent).pipe(
  $I.annoteSchema("DOMDragEvent", {
    description: "A DragEvent",
  })
);

/**
 * {@inheritDoc DOMDragEvent}
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DOMDragEvent = typeof DOMDragEvent.Type;
