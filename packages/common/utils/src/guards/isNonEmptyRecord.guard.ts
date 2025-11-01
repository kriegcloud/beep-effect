import type { StringTypes } from "@beep/types";
import * as R from "effect/Record";
import * as S from "effect/Schema";

type ReadonlyRecord<in out K extends StringTypes.NonEmptyString, out A> = {
  readonly [P in K]: A;
};

type NonEmptyReadonlyRecord<K extends StringTypes.NonEmptyString, A> = ReadonlyRecord<K, A> extends NonNullable<unknown>
  ? NonNullable<unknown> extends ReadonlyRecord<K, A>
    ? never
    : ReadonlyRecord<K, A>
  : ReadonlyRecord<K, A>;

const RecordStringKeysSchema = S.Record({
  key: S.NonEmptyString,
  value: S.Unknown,
});

export const isNonEmptyRecordWithNonEmptyStringKeys = <K extends StringTypes.NonEmptyString, A>(
  i: ReadonlyRecord<K, A>
): i is NonEmptyReadonlyRecord<K, A> => {
  if (!S.is(RecordStringKeysSchema)) return false;
  return !(R.isEmptyRecord(i) || R.isEmptyReadonlyRecord(i));
};
