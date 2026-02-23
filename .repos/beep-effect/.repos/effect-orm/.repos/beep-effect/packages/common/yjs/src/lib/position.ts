import { $YjsId } from "@beep/identity/packages";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $YjsId.create("@beep/yjs/lib/position.ts");

/**
 * Checks whether a given string is a valid Pos value. There are three rules:
 *
 *   - The string must not be the empty string
 *   - The string must not have any trailing "zeroes" (trailing " ")
 *   - All characters in the string must be from our alphabet
 *
 */
function isPos(str: string): str is Pos.Type {
  // May not be empty string
  if (Str.isEmpty(str)) {
    return false;
  }
  // Last digit may not be a "0" (no trailing zeroes)
  const lastIdx = str.length - 1;
  const option = Str.charCodeAt(lastIdx)(str).pipe(
    O.flatMap(O.liftPredicate(P.or(Num.lessThan(MIN_NON_ZERO_CODE), Num.greaterThan(MAX_CODE)))),
    O.flatMap(
      O.liftPredicate((lastIdx) => {
        for (let i = 0; i < lastIdx; i++) {
          const codeOpt = Str.charCodeAt(i)(str).pipe(
            O.flatMap(O.liftPredicate(P.or(Num.lessThan(MIN_CODE), Num.greaterThan(MAX_CODE))))
          );
          if (O.isNone(codeOpt)) return false;
        }
        return true;
      })
    )
  );

  return O.isSome(option);
}

export class Pos extends S.String.pipe(
  S.filter((str) => isPos(str) || "Not a valid Pos"),
  S.brand("Pos")
).annotations(
  $I.annotations("Pos", {
    description:
      'A valid/verified "position" string. These values are used as "parentKey"s by \n LiveList children, and define their relative ordering.',
  })
) {}

export declare namespace Pos {
  export type Type = typeof Pos.Type;
  export type Encoded = typeof Pos.Encoded;
}

const MIN_CODE = 32; // ASCII code of the lowest alphabet char (e.g. ' ')
const MAX_CODE = 126; // ASCII code of the highest alphabet char (e.g. '~')

const NUM_DIGITS = MAX_CODE - MIN_CODE + 1;

const ZERO: string = nthDigit(0); // " "

/**
 * The "first" canonical position.
 * In an equivalent decimal number system, think of this as the value .1.
 */
const ONE: Pos.Type = nthDigit(1); // "!"

const ZERO_NINE = Pos.make(ZERO + nthDigit(-1));

/**
 * Returns the Pos value for the nth digit in the alphabet.
 * Value must be between 0 and 94.
 *
 * Just used to generate some static data, and for usage in test cases.
 */
function nthDigit(n: 0): string; // "0" is a legal _digit_, but not a legal Pos value
function nthDigit(n: number): Pos.Type;
function nthDigit(n: number): Pos.Type {
  const code = MIN_CODE + (n < 0 ? NUM_DIGITS + n : n);
  if (code < MIN_CODE || code > MAX_CODE) {
    throw new Error(`Invalid n value: ${n}`);
  }
  return Pos.make(String.fromCharCode(code));
}

/**
 * Given two positions, returns the position value that lies in the middle.
 * When given only a high bound, computes the canonical position "before" it.
 * When given only a low bound, computes the canonical position "after" it.
 * When given no bounds at all, returns the "first" canonical position.
 */
function makePosition(x?: undefined | Pos.Type, y?: undefined | Pos.Type): Pos.Type {
  if (P.isNotUndefined(x) && P.isNotUndefined(y)) {
    return between(x, y);
  }
  if (x !== undefined) {
    return after(x);
  }
  if (y !== undefined) {
    return before(y);
  }
  return ONE;
}

/**
 * Given any position value, computes the canonical position "before" it.
 *
 * The equivalent in a decimal number system would be:
 *   before(.1)     // .09
 *   before(.11)    // .1
 *   before(.111)   // .1
 *   before(.2)     // .1
 *   before(.23101) // .2
 *   before(.3)     // .2
 *   ...
 *   before(.8)     // .7
 *   before(.9)     // .8
 *   before(.91)    // .9
 *   before(.92)    // .9
 *   before(.93)    // .9
 *   ...
 *   before(.98)    // .9
 *   before(.99)    // .9
 *
 * Note:
 *   before(.01)    // .009
 *   before(.001)   // .0009
 *   before(.002)   // .001
 *   before(.00283) // .002
 *
 */
function before(pos: Pos.Type): Pos.Type {
  const lastIndex = pos.length - 1;
  for (let i = 0; i <= lastIndex; i++) {
    const code = pos.charCodeAt(i);

    // Scan away all leading zeros, if there are any
    if (code <= MIN_CODE) {
      continue;
    }

    //
    // Now, i points to the first non-zero digit
    //
    // Two options:
    // 1. It's the last digit.
    //    a. If it's a 1, it's on the edge. Replace with "09".
    //    b. Otherwise, just lower it.
    // 2. It's not the last digit, so we can just chop off the remainder.
    //
    if (i === lastIndex) {
      if (code === MIN_CODE + 1) {
        return Pos.make(pos.substring(0, i) + ZERO_NINE);
      }
      return Pos.make(pos.substring(0, i) + String.fromCharCode(code - 1));
    }
    return Pos.make(pos.substring(0, i + 1));
  }

  // If we end up here, it means the input consisted of only zeroes, which is
  // invalid, so return the canonical first value as a best effort
  return ONE;
}

/**
 * Given any position value, computes the canonical position "after" it.
 *
 * The equivalent in a decimal number system would be:
 *   after(.001)  // .1
 *   after(.1)    // .2
 *   after(.101)  // .2
 *   after(.2)    // .3
 *   after(.3)    // .4
 *   ...
 *   after(.8)    // .9
 *   after(.9)    // .91
 *   after(.91)   // .92
 *   after(.9123) // .92
 *   ...
 *   after(.98)   // .99
 *   after(.99)   // .991
 *   after(.9999) // .99991
 *
 */
function after(pos: Pos.Type): Pos.Type {
  for (let i = 0; i <= pos.length - 1; i++) {
    const code = pos.charCodeAt(i);

    // Scan away all leading "nines", if there are any
    if (code >= MAX_CODE) {
      continue;
    }

    // Now, i points to the first non-"nine" digit
    return Pos.make(pos.substring(0, i) + String.fromCharCode(code + 1));
  }

  // If we end up here, it means the input consisted of only "nines", means we
  // can just append a ONE digit.
  return Pos.make(pos + ONE);
}

/**
 * Given two positions, returns the position value that lies in the middle.
 *
 * Think:
 *   between('!', '%')  // '#'    (like how between(.1, .5) would be .3)
 *   between('!', '"')  // '!O'   (like how between(.1, .2) would be .15)
 *
 *   between(.1, .3)      // .2
 *   between(.1, .4)      // also .2
 *   between(.1, .5)      // .3
 *   between(.11, .21)    // .15
 *   between(.1,  .1003)  // .1001
 *   between(.11, .12)    // .115
 *   between(.09, .1)     // .095
 *   between(.19, .21)    // .195
 *
 */
function between(lo: Pos.Type, hi: Pos.Type): Pos.Type {
  if (lo < hi) {
    return _between(lo, hi);
  }
  if (lo > hi) {
    return _between(hi, lo);
  }
  throw new Error("Cannot compute value between two equal positions");
}

/**
 * Like between(), but guaranteed that lo < hi.
 */
function _between(lo: Pos.Type, hi: Pos.Type | ""): Pos.Type {
  let index = 0;

  const loLen = lo.length;
  const hiLen = hi.length;
  while (true) {
    const loCode = index < loLen ? lo.charCodeAt(index) : MIN_CODE;
    const hiCode = index < hiLen ? hi.charCodeAt(index) : MAX_CODE;

    if (loCode === hiCode) {
      index++;
      continue;
    }

    // Difference of only 1 means we'll have to settle this in the next digit
    if (hiCode - loCode === 1) {
      const size = index + 1;
      let prefix = lo.substring(0, size);
      if (prefix.length < size) {
        prefix += ZERO.repeat(size - prefix.length);
      }
      const suffix = Pos.make(lo.substring(size));
      const nines = ""; // Will get interpreted like .999999…
      return Pos.make(prefix + _between(suffix, nines));
    }
    // Difference of more than 1 means we take the "middle" between these digits
    return Pos.make(takeN(lo, index) + String.fromCharCode((hiCode + loCode) >> 1));
  }
}

function takeN(pos: string, n: number): string {
  return n < pos.length ? pos.substring(0, n) : pos + ZERO.repeat(n - pos.length);
}

const MIN_NON_ZERO_CODE = MIN_CODE + 1;

function convertToPos(str: string): Pos.Type {
  const codes: number[] = [];

  // All chars in the string must be in the min-max range
  for (let i = 0; i < str.length; i++) {
    const codeOpt = Str.charCodeAt(i)(str);

    if (O.isSome(codeOpt)) {
      const code = codeOpt.value;
      codes.push(code < MIN_CODE ? MIN_CODE : code > MAX_CODE ? MAX_CODE : code);
    }
    // Clamp to min-max range
  }

  // Strip all trailing zeros
  while (codes.length > 0 && codes[codes.length - 1] === MIN_CODE) {
    codes.length--;
  }

  return codes.length > 0
    ? F.pipe(String.fromCharCode(...codes), Pos.make)
    : // Edge case: the str was a 0-only string, which is invalid. Default back to .1
      ONE;
}

/**
 * Checks that a str is a valid Pos, and converts it to the nearest valid one
 * if not.
 */
function asPos(str: string): Pos.Type {
  // Calling convertToPos(str) would suffice here, but since this is a hot code
  // path, we prefer to just check, which is a lot faster.
  return S.is(Pos)(str) ? str : convertToPos(str);
}

export { asPos, makePosition };

// For use in unit tests only
export {
  after as __after,
  before as __before,
  between as __between,
  isPos as __isPos,
  nthDigit as __nthDigit,
  NUM_DIGITS as __NUM_DIGITS,
};
