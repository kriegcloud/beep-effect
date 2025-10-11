import { invariant } from "@beep/invariant";
import type { StringTypes } from "@beep/types";
import { valuesFromEnum } from "@beep/utils/transformations/valuesFromEnum";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import type * as R from "effect/Record";
import { create } from "mutative";
export type EnumOf = <T extends string>(
  ...literals: A.NonEmptyReadonlyArray<StringTypes.NonEmptyString<T>>
) => {
  readonly [K in T]: K;
};
export const enumOf: EnumOf = <T extends string>(
  ...literals: A.NonEmptyReadonlyArray<StringTypes.NonEmptyString<T>>
) => {
  const enumObj = A.reduce(literals, {} as { readonly [K in T]: K }, (acc, k) => ({ ...acc, [k]: k }));
  invariant(P.isReadonlyRecord(enumObj), "Expected enum to be a readonly record", {
    file: "packages/common/utils/src/transformations/enumFromStringArray.ts",
    line: 18,
    args: [enumObj],
  });
  return enumObj;
};

export type EnumValues = <K extends string, A extends string>(o: R.ReadonlyRecord<K, A>) => A.NonEmptyReadonlyArray<A>;

export const enumValues: EnumValues = F.flow(
  <K extends string, A extends string>(o: R.ReadonlyRecord<K, A>): A.NonEmptyReadonlyArray<A> => {
    const values = valuesFromEnum(o);

    invariant(A.isNonEmptyReadonlyArray(values), "Expected enum to have values", {
      file: "packages/common/utils/src/transformations/enumFromStringArray.ts",
      line: 32,
      args: [values],
    });
    invariant(A.every(values, P.isString), "Expected enum values to be strings", {
      file: "packages/common/utils/src/transformations/enumFromStringArray.ts",
      line: 33,
      args: [values],
    });

    return values;
  }
);

export type EnumFromStringArray = <T extends A.NonEmptyReadonlyArray<string>>(...values: T) => { [K in T[number]]: K };
export const enumFromStringArray: EnumFromStringArray = <T extends A.NonEmptyReadonlyArray<string>>(...values: T) =>
  A.reduce(
    values,
    {} as { [K in T[number]]: K },
    (acc, k) =>
      create(acc, (draft: { [K in T[number]]: K }) => {
        draft[k as keyof typeof draft] = k;
      }) as { [K in T[number]]: K }
  );
