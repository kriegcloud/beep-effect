import type { UnsafeTypes } from "@beep/types";
import type * as R from "effect/Record";
import type * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as AnnotationId from "./_id";

const Id = AnnotationId.Id.compose("default-form-values-annotations");

export const DefaultFormValuesAnnotationId = Symbol.for(Id.compose("DefaultFormValuesAnnotationId").identifier);

/**
 * @catagory annotations
 * @since 0.1.0
 */
export type DefaultFormValuesAnnotation<A extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>> = {
  readonly [K in keyof A]: A[K];
};

export const getDefaultFormValuesAnnotation = <A, I extends R.ReadonlyRecord<string | symbol, UnsafeTypes.UnsafeAny>>(
  self: S.Schema<A, I>
) => AST.getAnnotation<I>(DefaultFormValuesAnnotationId)(self.ast);
