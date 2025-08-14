import type { RecordTypes, UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as HashSet from "effect/HashSet";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";

export const recordKeys = <T extends UnsafeTypes.UnsafeReadonlyRecord>(
  record: RecordTypes.NonEmptyRecordWithStringKeys<T>,
): A.NonEmptyReadonlyArray<keyof T> => {
  const set = HashSet.make(...Struct.keys(record));
  return HashSet.values(set) as unknown as A.NonEmptyReadonlyArray<keyof T>;
};

export const recordStringValues = <
  R extends RecordTypes.RecordStringKeyValueString,
>(
  r: RecordTypes.NonEmptyRecordStringKeyValues<R>,
) => {
  return R.values(
    r,
  ) as unknown as RecordTypes.ReadonlyRecordValuesNonEmptyArray<
    RecordTypes.NonEmptyRecordStringKeyValues<R>
  >;
};
