import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

/**
 * Return the first present Option from a list of candidates.
 *
 * @since 0.0.0
 * @category Utility
 */
export const firstSome = <A>(options: ReadonlyArray<O.Option<A>>): O.Option<A> =>
  pipe(options, A.findFirst(O.isSome), O.flatten);

/**
 * Convert an Option into a readonly array of length 0 or 1.
 *
 * @since 0.0.0
 * @category Utility
 */
export const optionToReadonlyArray = <A>(option: O.Option<A>): ReadonlyArray<A> =>
  O.match(option, {
    onNone: A.empty,
    onSome: A.of,
  });
