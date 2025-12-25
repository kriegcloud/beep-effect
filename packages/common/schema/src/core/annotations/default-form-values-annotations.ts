/**
 * Annotation helpers for providing default form values on schemas.
 *
 * @category Core/Annotations
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import type * as R from "effect/Record";
import type * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

const $I = $SchemaId.create("core/annotations/default-form-values-annotations");

/**
 * Symbol used to store default form value metadata on schemas.
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const DefaultFormValuesAnnotationId = Symbol.for($I`DefaultFormValuesAnnotationId`);

/**
 * Default form values annotation payload keyed by form field.
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export type DefaultFormValuesAnnotation<A extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>> = {
  readonly [K in keyof A]: A[K];
};

/**
 * Reads the default form values annotation from a schema.
 *
 * @category Core/Annotations
 * @since 0.1.0
 */
export const getDefaultFormValuesAnnotation = <A, I extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>>(
  self: S.Schema<A, I>
) => AST.getAnnotation<I>(DefaultFormValuesAnnotationId)(self.ast);
