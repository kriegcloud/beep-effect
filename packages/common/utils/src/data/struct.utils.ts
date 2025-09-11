import type { RecordTypes, StructTypes } from "@beep/types";
import type * as A from "effect/Array";
import * as Struct from "effect/Struct";
export const structEntries = <T extends RecordTypes.RecordStringKeyValueString>(
  s: RecordTypes.NonEmptyRecordStringKeyValues<T>
) => {
  return Struct.entries(s) as unknown as RecordTypes.ReadonlyRecordEntriesNonEmptyArray<T>;
};

export const structKeys = <T extends StructTypes.StructFieldsWithStringKeys>(
  s: StructTypes.NonEmptyStructFields<T>
) => {
  return Struct.keys(s) as unknown as A.NonEmptyReadonlyArray<keyof T & string>;
};
