/**
 * DOM schema helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { A, P } from "@beep/utils";
import * as S from "effect/Schema";
import type * as React from "react";

const $I = $SchemaId.create("DomReactNode");

/**
 * Type guard for React.ReactNode.
 *
 * @since 0.0.0
 * @category guards
 */
export const isReactNode = (u: unknown): u is React.ReactNode => {
  if (u === null || u === undefined) {
    return true;
  }
  const typeofU = typeof u;
  if (typeofU === "string" || typeofU === "number" || typeofU === "boolean") {
    return true;
  }
  if (A.isArray(u)) {
    return A.every(u, isReactNode);
  }
  return P.isObject(u) && !P.isNull(u);
};

/**
 * A React.ReactNode value.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DOMReactNode = S.declare(isReactNode).pipe(
  $I.annoteSchema("DOMReactNode", {
    description: "A React.ReactNode",
  })
);

/**
 * Type for {@link DOMReactNode}.
 *
 * @since 0.0.0
 * @category models
 */
export type DOMReactNode = typeof DOMReactNode.Type;

/**
 * Type guard for React.Ref<T>.
 *
 * @since 0.0.0
 * @category guards
 */
export const isReactRef = <T>(u: unknown): u is React.Ref<T> => {
  if (u === null || u === undefined) {
    return true;
  }
  const typeofU = typeof u;
  if (typeofU === "function" || typeofU === "string") {
    return true;
  }
  return P.isObject(u) && !P.isNull(u) && "current" in u;
};

/**
 * Creates a schema for React.Ref<T> where T extends HTMLElement.
 *
 * @since 0.0.0
 * @category constructors
 */
export const createDOMRefSchema = <T extends HTMLElement>() =>
  S.declare(isReactRef<T>).pipe(
    $I.annoteSchema("DOMRef", {
      description: "A React.Ref for an HTMLElement",
    })
  );

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { DOMReactNode as DomReactNode, DOMReactNode as Schema };
