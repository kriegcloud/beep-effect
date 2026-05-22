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

const $I = $SchemaId.create("DomCssProperties");

/**
 * Type guard for React.CSSProperties.
 *
 * @since 0.0.0
 * @category guards
 */
export const isCSSProperties = (u: unknown): u is React.CSSProperties => {
  if (P.not(P.isObject)(u) || P.isNull(u)) {
    return false;
  }
  return !A.isArray(u) && Object.prototype.toString.call(u) === "[object Object]";
};

/**
 * A React.CSSProperties object.
 *
 * @since 0.0.0
 * @category schemas
 */
export const DOMCssProperties = S.declare(isCSSProperties).pipe(
  $I.annoteSchema("DOMCssProperties", {
    description: "A React.CSSProperties",
  })
);

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { DOMCssProperties as DomCssProperties, DOMCssProperties as Schema };
