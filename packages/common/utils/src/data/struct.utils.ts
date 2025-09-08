import type { RecordTypes } from "@beep/types";
import * as Struct from "effect/Struct";
export const structEntries = <T extends RecordTypes.RecordStringKeyValueString>(
  s: RecordTypes.NonEmptyRecordStringKeyValues<T>
) => {
  return Struct.entries(s) as unknown as RecordTypes.ReadonlyRecordEntriesNonEmptyArray<T>;
};
