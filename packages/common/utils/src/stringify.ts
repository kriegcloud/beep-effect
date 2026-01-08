import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as R from "effect/Record";

/**
 * Predicate that checks if a value is a plain record (object) but not an array.
 */
const isPlainRecord: P.Refinement<unknown, Record<string, unknown>> = P.and(
  P.and(P.isNotNull, P.isRecord),
  (x): x is Record<string, unknown> => !A.isArray(x)
);

/**
 * Replacer function for JSON.stringify that ensures stable key ordering.
 * Uses Effect predicates and functional transformations.
 */
function replacer(_key: string, value: unknown): unknown {
  if (!isPlainRecord(value)) {
    return value;
  }

  // Sort keys and rebuild object with stable ordering
  return F.pipe(
    value,
    R.toEntries,
    A.sortWith(([key]) => key, Order.string),
    R.fromEntries
  );
}

/**
 * Like JSON.stringify(), but using stable (sorted) object key order, so that
 * it returns the same value for the same keys, no matter their order.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, replacer);
}

/**
 * Drop-in replacement for JSON.stringify(), which will log any payload to the
 * console if it could not be stringified somehow.
 */
export function stringifyOrLog(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch (err) {
    console.error(`Could not stringify: ${(err as Error).message}`);
    console.error(value);

    throw err;
  }
}
