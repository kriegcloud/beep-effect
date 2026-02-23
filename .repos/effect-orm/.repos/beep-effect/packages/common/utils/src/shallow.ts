import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as R from "effect/Record";

/**
 * Compares two arrays for shallow equality.
 * Returns true if arrays have the same length and all elements are strictly equal.
 *
 * @param xs - First array
 * @param ys - Second array
 * @returns true if arrays are shallowly equal
 */
export const shallowArray = (xs: Array<unknown>, ys: Array<unknown>): boolean =>
  F.pipe(
    // First check: lengths must match
    Eq.equals(xs.length, ys.length),
    // If lengths don't match, short-circuit to false
    // Otherwise, zip arrays and check element-wise equality
    (lengthsEqual) =>
      lengthsEqual &&
      F.pipe(
        A.zip(xs, ys),
        A.every(([x, y]) => Object.is(x, y))
      )
  );

/**
 * Compares two objects for shallow equality.
 * Returns true if both are records with the same keys and all values are strictly equal.
 *
 * @param objA - First object
 * @param objB - Second object
 * @returns true if objects are shallowly equal
 */
export const shallowObj = (objA: unknown, objB: unknown): boolean => {
  // Type guard: both must be records
  if (!P.isRecord(objA) || !P.isRecord(objB)) {
    return false;
  }

  const keysA = R.keys(objA);
  const keysB = R.keys(objB);

  // Length check first (cheap comparison)
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Check all keys exist in objB and values are strictly equal
  return F.pipe(
    keysA,
    A.every((key) => R.has(objB, key) && Object.is(objA[key], objB[key]))
  );
};

/**
 * Shallowly compares two given values.
 *
 * - Two simple values are considered equal if they're strictly equal
 * - Two arrays are considered equal if their members are strictly equal
 * - Two objects are considered equal if their values are strictly equal
 *
 * Testing goes one level deep.
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if values are shallowly equal
 */
export const shallow = (a: unknown, b: unknown): boolean => {
  // Fast path: identity check
  if (Object.is(a, b)) {
    return true;
  }

  // Use Match for type-based dispatching
  return Match.value({ a, b }).pipe(
    // Case 1: Both are arrays
    Match.when(
      ({ a, b }) => A.isArray(a) && A.isArray(b),
      ({ a, b }) => shallowArray(a as Array<unknown>, b as Array<unknown>)
    ),
    // Case 2: Only one is array - not equal
    Match.when(
      ({ a, b }) => A.isArray(a) || A.isArray(b),
      () => false
    ),
    // Case 3: Try object comparison (handles records, falls back to false)
    Match.orElse(({ a, b }) => shallowObj(a, b))
  );
};

/**
 * Two-level deep shallow check.
 * Useful for checking equality of `{ isLoading: false, myData: [ ... ] }` like
 * data structures, where you want to do a shallow comparison on the "data"
 * key.
 *
 * NOTE: Works on objects only, not on arrays!
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if values are shallowly equal at two levels
 */
export function shallow2(a: unknown, b: unknown): boolean {
  // Type guard: both must be records
  if (!P.isRecord(a) || !P.isRecord(b)) {
    return shallow(a, b);
  }

  const keysA = R.keys(a);
  const keysB = R.keys(b);

  // Length check first
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Check all keys exist and their values are shallowly equal
  return F.pipe(
    keysA,
    A.every((key) => R.has(b, key) && shallow(a[key], b[key]))
  );
}
