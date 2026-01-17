import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

const isStructField = (u: unknown): u is S.Struct.Field => P.or(S.isSchema, S.isPropertySignature)(u);

const isStructFieldKey = (u: unknown): u is PropertyKey => S.is(S.PropertyKey)(u);

const isStructFields = (u: unknown): u is S.Struct.Fields =>
  P.isReadonlyRecord(u) && A.some(Struct.entries(u), ([k, v]) => isStructFieldKey(k) && isStructField(v));

const isStructAny = (u: unknown): u is S.Struct<UnsafeTypes.UnsafeAny> =>
  S.isSchema(u) && P.hasProperty("fields")(u) && isStructFields(u.fields);

export const structOrElseMakeFromFields = Match.type<S.Struct<UnsafeTypes.UnsafeAny> | S.Struct.Fields>().pipe(
  Match.when(isStructAny, (u) => u as UnsafeTypes.UnsafeAny),
  Match.when(isStructFields, (u) => S.Struct(u as UnsafeTypes.UnsafeAny)),
  Match.exhaustive
);
