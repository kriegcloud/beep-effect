/**
 * Struct helper implementations surfaced as `Utils.StructUtils`, enabling docs
 * to communicate how schema field collections become typed arrays of keys,
 * values, and entries.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const structUtilsFields = { id: S.String };
 * const structUtilsKeys = Utils.StructUtils.structKeys(structUtilsFields);
 * const structUtilsExample: FooTypes.Prettify<typeof structUtilsKeys> = structUtilsKeys;
 * void structUtilsExample;
 *
 * @category Documentation
 * @since 0.1.0
 */
import { invariant } from "@beep/invariant";
import type { RecordTypes, StructTypes } from "@beep/types";
import type { ReadonlyRecordEntriesNonEmptyArray } from "@beep/types/record.types";
import type * as StringTypes from "@beep/types/string.types";
import type { NonEmptyString } from "@beep/types/string.types";
import type * as A from "effect/Array";
import * as R from "effect/Record";
import type * as S from "effect/Schema";
import * as Struct from "effect/Struct";

/**
 * Produces non-empty `[key, value]` tuples from records whose keys and values
 * are strings, retaining literal inference.
 *
 * @example
 * import { StructUtils } from "@beep/utils";
 *
 * const entries = StructUtils.structStringEntries({ en: "English" } as const);
 *
 * @category Data
 * @since 0.1.0
 */
export const structStringEntries = <T extends RecordTypes.RecordStringKeyValueString>(
  s: RecordTypes.NonEmptyRecordStringKeyValues<T>
) => {
  return Struct.entries(s) as unknown as RecordTypes.ReadonlyRecordEntriesNonEmptyArray<T>;
};
/**
 * Utility type representing struct fields keyed by non-empty strings with
 * Effect schemas as values.
 *
 * @example
 * import type { RecordValueSchemaAny } from "@beep/utils/data/struct.utils";
 *
 * type Fields = RecordValueSchemaAny;
 *
 * @category Data
 * @since 0.1.0
 */
export type RecordValueSchemaAny = {
  readonly [x: StringTypes.NonEmptyString]: S.Any;
};

/**
 * Restricts struct field definitions to non-empty objects so helpers can assume
 * at least one field exists.
 *
 * @example
 * import type { NonEmptyStructValueSchemaAny } from "@beep/utils/data/struct.utils";
 * import * as S from "effect/Schema";
 *
 * type NonEmpty = NonEmptyStructValueSchemaAny<{ id: S.String }>;
 *
 * @category Data
 * @since 0.1.0
 */
export type NonEmptyStructValueSchemaAny<T extends RecordValueSchemaAny> = keyof T extends string
  ? keyof T extends NonEmptyString<keyof T>
    ? T extends NonNullable<unknown>
      ? NonNullable<unknown> extends T
        ? never
        : T
      : T
    : never
  : never;
/**
 * Extracts schema field values from a non-empty struct definition and returns
 * them as a readonly array, asserting the struct is not empty.
 *
 * @example
 * import { StructUtils } from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const values = StructUtils.structValues({ id: S.String });
 *
 * @category Data
 * @since 0.1.0
 */
export const structValues = <const Fields extends RecordValueSchemaAny>(
  fields: NonEmptyStructValueSchemaAny<Fields>
): A.NonEmptyReadonlyArray<Fields[keyof Fields]> => {
  invariant(!R.isEmptyReadonlyRecord(fields), "Empty struct", {
    file: "packages/common/utils/src/data/struct.utils.ts",
    line: 31,
    args: [fields],
  });
  return R.values(fields) as unknown as A.NonEmptyReadonlyArray<Fields[keyof Fields]>;
};

/**
 * Returns the string keys of a non-empty struct field definition, preserving
 * literal key types.
 *
 * @example
 * import { StructUtils } from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const keys = StructUtils.structKeys({ id: S.String });
 *
 * @category Data
 * @since 0.1.0
 */
export const structKeys = <T extends StructTypes.StructFieldsWithStringKeys>(
  s: StructTypes.NonEmptyStructFields<T>
) => {
  return Struct.keys(s) as unknown as A.NonEmptyReadonlyArray<keyof T & string>;
};

/**
 * Returns typed key/value pairs for a struct definition, ensuring the fields
 * object is non-empty to avoid runtime ambiguity.
 *
 * @example
 * import { StructUtils } from "@beep/utils";
 * import * as S from "effect/Schema";
 *
 * const entries = StructUtils.structEntries({ id: S.String });
 *
 * @category Data
 * @since 0.1.0
 */
export const structEntries = <T extends StructTypes.StructFieldsWithStringKeys>(
  s: StructTypes.NonEmptyStructFields<T>
): ReadonlyRecordEntriesNonEmptyArray<T> => {
  invariant(!R.isEmptyReadonlyRecord(s), "Empty struct", {
    file: "packages/common/utils/src/data/struct.utils.ts",
    line: 51,
    args: [s],
  });
  return Struct.entries(s) as unknown as ReadonlyRecordEntriesNonEmptyArray<T>;
};
