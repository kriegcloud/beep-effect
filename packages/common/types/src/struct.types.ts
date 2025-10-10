import type * as A from "effect/Array";
import type * as S from "effect/Schema";
import type { NonEmptyRecordWithStringKeys } from "./record.types.js";
import type * as StringTypes from "./string.types.js";
import type { NonEmptyString } from "./string.types.js";
import type * as UnsafeTypes from "./unsafe.types.js";
export type StructFieldsWithStringKeys = {
  readonly [x: StringTypes.NonEmptyString<string>]: S.Struct.Field;
};

export type NonEmptyStructFields<T extends StructFieldsWithStringKeys> = keyof T extends string
  ? keyof T extends NonEmptyString<keyof T>
    ? T extends NonNullable<unknown>
      ? NonNullable<unknown> extends T
        ? never
        : T
      : T
    : never
  : never;

export type NonEmptyReadonlyStructFieldKeys<T extends StructFieldsWithStringKeys> = T extends NonEmptyStructFields<T>
  ? A.NonEmptyReadonlyArray<keyof NonEmptyStructFields<T> & string>
  : never;

export type ReadonlyNonEmptyRecordKeys<T extends UnsafeTypes.UnsafeReadonlyRecord> =
  T extends NonEmptyRecordWithStringKeys<T> ? A.NonEmptyReadonlyArray<keyof T> : never;

export type StructFieldsOrPropertySignatures = StructFieldsWithStringKeys | S.PropertySignature.Any;

export type NonEmptyStructFieldsOrPropertySignatures<T extends StructFieldsOrPropertySignatures> =
  keyof T extends string
    ? keyof T extends NonEmptyString<keyof T>
      ? T extends NonNullable<unknown>
        ? NonNullable<unknown> extends T
          ? never
          : T
        : T
      : never
    : never;
