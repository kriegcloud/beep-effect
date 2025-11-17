/**
 * Helper that backs `Utils.valuesFromEnum`, extracting typed arrays of enum
 * values used by doc examples.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const valuesFromEnumModuleSource: { readonly foo: "foo" } = { foo: "foo" };
 * const valuesFromEnumModule = Utils.valuesFromEnum(valuesFromEnumModuleSource);
 * const valuesFromEnumRecord: FooTypes.Prettify<typeof valuesFromEnumModule> = valuesFromEnumModule;
 * void valuesFromEnumRecord;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import { invariant } from "@beep/invariant";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";

/**
 * Type for helpers that extract non-empty value arrays from readonly enums.
 *
 * @example
 * import type { ValuesFromEnum } from "@beep/utils/transformations/valuesFromEnum";
 *
 * const fn: ValuesFromEnum = (input) => [] as never;
 *
 * @category Transformations/Enum
 * @since 0.1.0
 */
export type ValuesFromEnum = <K extends string, A extends string>(
  inputEnum: R.ReadonlyRecord<K, A>
) => A.NonEmptyReadonlyArray<A>;

/**
 * Returns the values of a readonly enum as a non-empty array, asserting the
 * enum is non-empty.
 *
 * @example
 * import { valuesFromEnum } from "@beep/utils/transformations/valuesFromEnum";
 *
 * valuesFromEnum({ pending: "pending" } as const);
 *
 * @category Transformations/Enum
 * @since 0.1.0
 */
export const valuesFromEnum: ValuesFromEnum = F.flow(
  <K extends string, A extends string>(inputEnum: R.ReadonlyRecord<K, A>): A.NonEmptyReadonlyArray<A> => {
    invariant(!R.isEmptyReadonlyRecord(inputEnum), "Empty enum", {
      file: "packages/common/utils/src/transformations/valuesFromEnum.ts",
      line: 10,
      args: [inputEnum],
    });
    const values = R.values(inputEnum) as readonly (string & A)[];
    invariant(A.isNonEmptyReadonlyArray(values), "Empty enum", {
      file: "packages/common/utils/src/transformations/valuesFromEnum.ts",
      line: 13,
      args: [inputEnum],
    });
    return values;
  }
);
