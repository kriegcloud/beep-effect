import type { UnsafeTypes } from "@beep/types";
import type * as Pipeable from "effect/Pipeable";
import type * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

export interface AnySchema extends Pipeable.Pipeable {
  readonly [S.TypeId]: UnsafeTypes.UnsafeAny;
  readonly Type: UnsafeTypes.UnsafeAny;
  readonly Encoded: UnsafeTypes.UnsafeAny;
  readonly Context: UnsafeTypes.UnsafeAny;
  readonly make?: (
    params: UnsafeTypes.UnsafeAny,
    ...rest: ReadonlyArray<UnsafeTypes.UnsafeAny>
  ) => UnsafeTypes.UnsafeAny;
  readonly ast: AST.AST;
  readonly annotations: UnsafeTypes.UnsafeAny;
}

export interface AnyTaggedRequestSchema extends AnySchema {
  readonly _tag: string;
  readonly success: S.Schema.Any;
  readonly failure: S.Schema.All;
}

export type AnyErrorSchema = S.Schema.All;

export type AnySuccessSchema = S.Schema.Any;

export type AnyPayloadSchema = AnySchema;

export type StructFromSelfOrFields<P> =
  P extends S.Struct<infer _> ? P : P extends S.Struct.Fields ? S.Struct<P> : never;

export type AnyStructOrFields = S.Struct<UnsafeTypes.UnsafeAny> | S.Struct.Fields;
