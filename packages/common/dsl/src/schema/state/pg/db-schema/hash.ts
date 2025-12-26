import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

/**
 * Computes a hash code for a string using the djb2 algorithm.
 * Returns 0 for empty strings.
 *
 * @example
 * ```ts
 * hashCode("hello") // 99162322
 * hashCode("")      // 0
 * ```
 */
export const hashCode = (str: string): number =>
  F.pipe(
    str,
    O.liftPredicate(P.not(Str.isEmpty)),
    O.match({
      onNone: F.constant(0),
      onSome: (s) =>
        F.pipe(
          A.makeBy(Str.length(s), F.identity),
          A.reduce(0, (hash, i) =>
            F.pipe(
              Str.charCodeAt(s, i),
              O.match({
                onNone: F.constant(hash),
                onSome: (chr) => Math.trunc((hash << 5) - hash + chr),
              })
            )
          )
        ),
    })
  );
