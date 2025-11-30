import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { mergeWith, omitBy } from "lodash";
export const mergeDefined = <TSource1, TSource2>(
  source1: TSource1,
  source2: TSource2,
  {
    mergeArrays = false,
    omitNull,
  }: { readonly mergeArrays?: undefined | boolean; readonly omitNull?: undefined | boolean } = {}
) => {
  let merged = mergeWith<{}, TSource1, TSource2>({}, source1, source2, (a, b) => {
    if ((!omitNull && !P.isNotUndefined(a)) || (omitNull && P.isUndefined(a))) {
      return b;
    }
    if (A.isArray(a) && A.isArray(b)) {
      return mergeArrays ? a.concat(b) : b;
    }

    return a;
  });

  merged = omitBy(merged, omitNull ? P.isUndefined : P.isNullable) as any;

  return merged;
};
