import type {RecordTypes, StructTypes} from "@beep/types";
import type * as A from "effect/Array";
import * as Struct from "effect/Struct";
import * as S from "effect/Schema";
import * as R from "effect/Record";
import type * as StringTypes from "@beep/types/string.types";
import type {NonEmptyString} from "@beep/types/string.types";
import { invariant } from "@beep/invariant";
import type {ReadonlyRecordEntriesNonEmptyArray} from "@beep/types/record.types";

export const structStringEntries = <T extends RecordTypes.RecordStringKeyValueString>(
  s: RecordTypes.NonEmptyRecordStringKeyValues<T>
) => {
  return Struct.entries(s) as unknown as RecordTypes.ReadonlyRecordEntriesNonEmptyArray<T>;
};
export type RecordValueSchemaAny = {
  readonly [x: StringTypes.NonEmptyString]: S.Any;
};

export type NonEmptyStructValueSchemaAny<T extends RecordValueSchemaAny> = keyof T extends string
  ? keyof T extends NonEmptyString<keyof T>
    ? T extends NonNullable<unknown>
      ? NonNullable<unknown> extends T
        ? never
        : T
      : T
    : never
  : never;
export const structValues = <
  const Fields extends RecordValueSchemaAny
>(fields: NonEmptyStructValueSchemaAny<Fields>): A.NonEmptyReadonlyArray<Fields[keyof Fields]> => {
  invariant(!R.isEmptyReadonlyRecord(fields), "Empty struct", {
    file: "packages/common/utils/src/data/struct.utils.ts",
    line: 31,
    args: [fields],
  });
  return R.values(fields) as unknown as A.NonEmptyReadonlyArray<Fields[keyof Fields]>;
};

export const structKeys = <T extends StructTypes.StructFieldsWithStringKeys>(
  s: StructTypes.NonEmptyStructFields<T>
) => {
  return Struct.keys(s) as unknown as A.NonEmptyReadonlyArray<keyof T & string>;
};

export const structEntries = <T extends StructTypes.StructFieldsWithStringKeys>(
  s: StructTypes.NonEmptyStructFields<T>
): ReadonlyRecordEntriesNonEmptyArray<T> => {
  invariant(!R.isEmptyReadonlyRecord(s), "Empty struct", {
    file: "packages/common/utils/src/data/struct.utils.ts",
    line: 51,
    args: [s],
  });
  return Struct.entries(s) as unknown as ReadonlyRecordEntriesNonEmptyArray<T>
};