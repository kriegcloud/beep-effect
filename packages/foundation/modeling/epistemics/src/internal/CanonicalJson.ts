/**
 * Internal canonical JSON encoder for the digest-bearing epistemic values
 * (contradiction seals, detection proposal ids, evidence-verification keys).
 * Not part of the public API surface: the package `exports` map nulls
 * `./internal/*`.
 *
 * Byte-for-byte the encoder in `@beep/epistemic-domain`'s
 * `values/internal/CanonicalJson.ts`, which stays for the agent-authority
 * grant-set and ledger seals until those values get their own home; both copies
 * must encode identically or the digests they feed diverge.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { A, P, R } from "@beep/utils";
import * as Order from "effect/Order";

const isScalar: P.Predicate<unknown> = P.some([P.isNull, P.isNumber, P.isBoolean, P.isString]);

type CanonicalEntry = readonly [key: string, entry: unknown];

const byKeyAscending = Order.mapInput(Order.String, ([key]: CanonicalEntry) => key);

/**
 * Deterministic canonical JSON over wire-form values: object keys sorted
 * recursively so equal values always encode to equal strings. Operates on
 * already-encoded (wire-form) values, which are plain JSON by construction.
 *
 * @category encoding
 * @since 0.0.0
 */
export const canonicalJson = (value: unknown): string => {
  if (isScalar(value)) {
    return JSON.stringify(value);
  }
  if (A.isArray(value)) {
    return `[${A.join(A.map(value, canonicalJson), ",")}]`;
  }
  const defined: ReadonlyArray<CanonicalEntry> = A.filter(
    R.toEntries(value as R.ReadonlyRecord<string, unknown>),
    ([, entry]) => entry !== undefined
  );
  const entries = A.sort(defined, byKeyAscending);
  return `{${A.join(
    A.map(entries, ([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`),
    ","
  )}}`;
};
