/**
 * Bitemporal reads over claim versions from any binding of the envelope.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import { constFalse, dual } from "effect/Function";
import { knownAt } from "../KnowledgeInterval/index.ts";
import { holdsAt } from "../ValidInterval/index.ts";
import { ValidTime as ValidTimeSchema } from "./Claim.model.ts";
import type * as DateTime from "effect/DateTime";
import type { BitemporalScope, BitemporalVersion, ValidTime } from "./Claim.model.ts";

/**
 * Does a claim's valid time cover `at`? `Unknown` never does.
 *
 * **Example** (Unknown valid time is never selected)
 *
 * ```ts
 * import { validAt } from "@beep/epistemics/Claim"
 * import * as DateTime from "effect/DateTime"
 *
 * validAt({ _tag: "Unknown" }, DateTime.makeUnsafe(0)) // => false
 * ```
 *
 * @category claim
 * @since 0.0.0
 */
export const validAt: {
  (at: DateTime.Utc): (validTime: ValidTime) => boolean;
  (validTime: ValidTime, at: DateTime.Utc): boolean;
} = dual(2, (validTime: ValidTime, at: DateTime.Utc): boolean =>
  ValidTimeSchema.match(validTime, { Unknown: constFalse, Interval: (interval) => holdsAt(interval, at) })
);

/**
 * Select the versions known at `scope.asOf`, valid at `scope.validAt`, and in
 * one of `scope.states`.
 *
 * **Example** (Read the current accepted view)
 *
 * ```ts
 * import { versionsAt } from "@beep/epistemics/Claim"
 * import * as DateTime from "effect/DateTime"
 *
 * const now = DateTime.makeUnsafe(1_000)
 * versionsAt([], { asOf: now, validAt: now, states: ["Accepted"] }) // => []
 * ```
 *
 * @category claim
 * @since 0.0.0
 */
export const versionsAt: {
  (scope: BitemporalScope): <V extends BitemporalVersion>(ledger: ReadonlyArray<V>) => ReadonlyArray<V>;
  <V extends BitemporalVersion>(ledger: ReadonlyArray<V>, scope: BitemporalScope): ReadonlyArray<V>;
} = dual(
  2,
  <V extends BitemporalVersion>(ledger: ReadonlyArray<V>, scope: BitemporalScope): ReadonlyArray<V> =>
    A.filter(
      ledger,
      (v) =>
        knownAt(v.knowledge, scope.asOf) &&
        validAt(v.validTime, scope.validAt) &&
        A.contains(scope.states, v.review._tag)
    )
);
