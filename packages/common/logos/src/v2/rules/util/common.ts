import * as Operands from "@beep/logos/v2/internal/Operands";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as It from "effect/Iterable";
import * as S from "effect/Schema";

export class BetweenNumeric extends Operands.Between.Schema(
  S.Struct({
    min: S.Number,
    max: S.Number,
  }).pipe(
    S.filter(({ min, max }) => min < max, {
      message: () => "min must be less than max",
    })
  ),
  {
    inclusive: S.Boolean,
  }
) {
  static readonly validate = (op: BetweenNumeric.Type) => (value: number) => {
    const {
      value: { min, max },
      inclusive,
    } = op;
    const minInclusive = inclusive ? value >= min : value > min;
    const maxInclusive = inclusive ? value <= max : value < max;
    return minInclusive && maxInclusive;
  };
}

export namespace BetweenNumeric {
  export type Type = typeof BetweenNumeric.Type;
  export type Encoded = typeof BetweenNumeric.Encoded;
}

// Small helpers using the equivalence-aware array fns
export const has = (arr: ReadonlyArray<BS.Json.Type>, v: BS.Json.Type) => It.containsWith(BS.equalsJson)(v)(arr); // :contentReference[oaicite:10]{index=10}

export const intersect = (arr: ReadonlyArray<BS.Json.Type>, sel: ReadonlyArray<BS.Json.Type>) =>
  A.intersectionWith(BS.equalsJson)(sel)(arr); //

// elements in `need` that are NOT in `arr`
export const missingFrom = (needles: ReadonlyArray<BS.Json.Type>, haystack: ReadonlyArray<BS.Json.Type>) =>
  A.differenceWith(BS.equalsJson)(haystack)(needles); // needles \ haystack.

// membership by structural equality
export const containsJson = A.containsWith(BS.jsonEq);

export const countDistinctOverlaps = (arr: ReadonlyArray<BS.Json.Type>, sel: ReadonlyArray<BS.Json.Type>) => {
  const uniqSel = A.dedupeWith(BS.equalsJson)(sel); //
  let n = 0;
  for (const s of uniqSel) if (It.containsWith(BS.equalsJson)(s)(arr)) n++;
  return n;
};

export const intersectJson = (a: ReadonlyArray<BS.Json.Type>, b: ReadonlyArray<BS.Json.Type>) =>
  A.intersectionWith(BS.jsonEq)(b)(a);

// difference needles \ haystack with deep equality
export const differenceJson = (needles: ReadonlyArray<BS.Json.Type>, haystack: ReadonlyArray<BS.Json.Type>) =>
  A.differenceWith(BS.jsonEq)(haystack)(needles);

// dedupe selection using deep equality
export const dedupeJson = (xs: ReadonlyArray<BS.Json.Type>) => A.dedupeWith(BS.jsonEq)(xs);
