/**
 * Guard implementations for non-empty records with string keys, powering the
 * `Utils.isNonEmptyRecordWithNonEmptyStringKeys` namespace export.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const guardsRecordValue: FooTypes.Prettify<{ foo: number }> = { foo: 1 };
 * const guardsRecordResult = Utils.isNonEmptyRecordWithNonEmptyStringKeys(guardsRecordValue);
 * void guardsRecordResult;
 *
 * @category Documentation
 * @since 0.1.0
 */
import type { StringTypes } from "@beep/types";
import * as R from "effect/Record";
import * as S from "effect/Schema";

type ReadonlyRecord<in out K extends StringTypes.NonEmptyString, out A> = {
  readonly [P in K]: A;
};

type NonEmptyReadonlyRecord<K extends StringTypes.NonEmptyString, A> =
  ReadonlyRecord<K, A> extends NonNullable<unknown>
    ? NonNullable<unknown> extends ReadonlyRecord<K, A>
      ? never
      : ReadonlyRecord<K, A>
    : ReadonlyRecord<K, A>;

const RecordStringKeysSchema = S.Record({
  key: S.NonEmptyString,
  value: S.Unknown,
});

/**
 * Runtime guard for records that ensures they are non-empty and have
 * non-empty string keys.
 *
 * @example
 * import { isNonEmptyRecordWithNonEmptyStringKeys } from "@beep/utils/guards/isNonEmptyRecord.guard";
 *
 * isNonEmptyRecordWithNonEmptyStringKeys({ foo: 1 });
 *
 * @category Guards
 * @since 0.1.0
 */
export const isNonEmptyRecordWithNonEmptyStringKeys = <K extends StringTypes.NonEmptyString, A>(
  i: ReadonlyRecord<K, A>
): i is NonEmptyReadonlyRecord<K, A> => {
  if (!S.is(RecordStringKeysSchema)) return false;
  return !(R.isEmptyRecord(i) || R.isEmptyReadonlyRecord(i));
};
