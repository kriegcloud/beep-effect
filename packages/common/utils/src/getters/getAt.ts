/**
 * Implementation for the `Utils.getAt` helper, showing how nested data access
 * is protected against prototype pollution via forbidden key checks.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const gettersModuleNested: FooTypes.Prettify<{ profile: { email: string } }> = {
 *   profile: { email: "ops@example.com" },
 * };
 * const gettersModuleEmail = Utils.getAt(gettersModuleNested, "profile.email");
 * void gettersModuleEmail;
 *
 * @category Documentation
 * @since 0.1.0
 */
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

const FORBIDDEN = new Set(["__proto__", "prototype", "constructor"]);

type GetAt = (
  obj: unknown,
  path: string | (string | number)[],
  fallback?: unknown | undefined
) => UnsafeTypes.UnsafeAny;

/**
 * Reads deep properties from an object or array using dot/bracket notation with
 * optional fallback.
 *
 * @example
 * import { getAt } from "@beep/utils/getters/getAt";
 *
 * getAt({ items: [{ id: 1 }] }, "items[0].id");
 *
 * @category Getters
 * @since 0.1.0
 */
export const getAt: GetAt = (obj: unknown, path: string | Array<string | number>, fallback?: unknown | undefined) => {
  const parts = A.isArray(path)
    ? path
    : F.pipe(
        path,
        Str.replace(/\[(\d+)]/g, ".$1"), // a[0] -> a.0
        Str.split("."),
        A.filter(Boolean)
      );

  let cur: UnsafeTypes.UnsafeAny = obj;
  for (const key of parts) {
    if (P.isNullable(cur)) return fallback;
    if (P.isString(key) && FORBIDDEN.has(key)) return fallback;
    cur = cur[key as UnsafeTypes.UnsafeAny];
  }
  return P.isUndefined(cur) ? fallback : cur;
};
