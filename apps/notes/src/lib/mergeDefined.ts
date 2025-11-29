import { isArray, isNil, mergeWith, omitBy } from "lodash";
import { isDefined, isUndefined } from "platejs";

export const mergeDefined = <TSource1, TSource2>(
  source1: TSource1,
  source2: TSource2,
  {
    mergeArrays = false,
    omitNull,
  }: { readonly mergeArrays?: undefined | boolean; readonly omitNull?: undefined | boolean } = {}
) => {
  let merged = mergeWith<{}, TSource1, TSource2>({}, source1, source2, (a, b) => {
    if ((!omitNull && !isDefined(a)) || (omitNull && isUndefined(a))) {
      return b;
    }
    if (isArray(a) && isArray(b)) {
      return mergeArrays ? a.concat(b) : b;
    }

    return a;
  });

  merged = omitBy(merged, omitNull ? isUndefined : isNil) as any;

  return merged;
};
