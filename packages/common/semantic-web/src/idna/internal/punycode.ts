/**
 * Punycode encode/decode core.
 *
 * Ported from the existing implementation but rewritten to:
 * - never throw for normal invalid input / overflow / not-basic flows
 * - return `Either.Either<A, ParseIssue>` (via `effect/ParseResult` helpers)
 */

import * as A from "effect/Array";
import type * as Either from "effect/Either";
import * as ParseResult from "effect/ParseResult";
import type * as AST from "effect/SchemaAST";
import { ucs2decode } from "./ucs2.ts";

/** Highest positive signed 32-bit float value */
const maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128; // 0x80
const delimiter = "-"; // '\x2D'

const baseMinusTMin = base - tMin;

type FailureKind = "overflow" | "not-basic" | "invalid-input";

const FAILURE_MESSAGES: Record<FailureKind, string> = {
  overflow: "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input",
};

type Result<A> = Either.Either<A, ParseResult.ParseIssue>;

const fail = (ast: AST.AST, actual: unknown, kind: FailureKind): Result<never> =>
  ParseResult.fail(new ParseResult.Type(ast, actual, FAILURE_MESSAGES[kind]));

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 */
const basicToDigit = (codePoint: number): number => {
  if (codePoint >= 0x30 && codePoint < 0x3a) {
    return 26 + (codePoint - 0x30);
  }
  if (codePoint >= 0x41 && codePoint < 0x5b) {
    return codePoint - 0x41;
  }
  if (codePoint >= 0x61 && codePoint < 0x7b) {
    return codePoint - 0x61;
  }
  return base;
};

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 */
const digitToBasic = (digit: number, flag: number): number => {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * Number(digit < 26) - ((flag !== 0 ? 1 : 0) << 5);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 */
const adapt = (delta: number, numPoints: number, firstTime: boolean): number => {
  let k = 0;
  delta = firstTime ? Math.floor(delta / damp) : delta >> 1;
  delta += Math.floor(delta / numPoints);
  for (; delta > (baseMinusTMin * tMax) >> 1; k += base) {
    delta = Math.floor(delta / baseMinusTMin);
  }
  return Math.floor(k + ((baseMinusTMin + 1) * delta) / (delta + skew));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 */
export const decode = (ast: AST.AST, input: string): Result<string> => {
  // Don't use UCS-2.
  const output: Array<number> = [];
  const inputLength = input.length;
  let i = 0;
  let n = initialN;
  let bias = initialBias;

  // Handle the basic code points: let `basic` be the number of input code
  // points before the last delimiter, or `0` if there is none, then copy
  // the first basic code points to the output.
  let basic = input.lastIndexOf(delimiter);
  if (basic < 0) {
    basic = 0;
  }

  for (let j = 0; j < basic; ++j) {
    const cp = input.charCodeAt(j);
    if (cp >= 0x80) {
      return fail(ast, input, "not-basic");
    }
    output.push(cp);
  }

  // Main decoding loop: start just after the last delimiter if any basic code
  // points were copied; start at the beginning otherwise.
  for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (index >= inputLength) {
        return fail(ast, input, "invalid-input");
      }

      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= base) {
        return fail(ast, input, "invalid-input");
      }

      if (digit > Math.floor((maxInt - i) / w)) {
        return fail(ast, input, "overflow");
      }

      i += digit * w;

      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
      if (digit < t) {
        break;
      }

      const baseMinusT = base - t;
      if (w > Math.floor(maxInt / baseMinusT)) {
        return fail(ast, input, "overflow");
      }
      w *= baseMinusT;
    }

    const out = output.length + 1;
    bias = adapt(i - oldi, out, oldi === 0);

    if (Math.floor(i / out) > maxInt - n) {
      return fail(ast, input, "overflow");
    }

    n += Math.floor(i / out);
    i %= out;

    output.splice(i++, 0, n);
  }

  // `fromCodePoint` can throw for invalid code points; treat that as an input failure.
  return ParseResult.try({
    try: () => String.fromCodePoint(...output),
    catch: () => new ParseResult.Type(ast, input, FAILURE_MESSAGES["invalid-input"]),
  });
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
export const encode = (ast: AST.AST, input: string): Result<string> => {
  const output = A.empty<string>()

  // Convert the input in UCS-2 to an array of Unicode code points.
  const inputArray = ucs2decode(input);

  // Cache the length.
  const inputLength = inputArray.length;

  // Initialize the state.
  let n = initialN;
  let delta = 0;
  let bias = initialBias;

  // Handle the basic code points.
  for (const currentValue of inputArray) {
    if (currentValue < 0x80) {
      output.push(String.fromCharCode(currentValue));
    }
  }

  const basicLength = output.length;
  let handledCPCount = basicLength;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    output.push(delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next larger one:
    let m = maxInt;
    for (const currentValue of inputArray) {
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    const handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > Math.floor((maxInt - delta) / handledCPCountPlusOne)) {
      return fail(ast, input, "overflow");
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (const currentValue of inputArray) {
      if (currentValue < n && ++delta > maxInt) {
        return fail(ast, input, "overflow");
      }
      if (currentValue === n) {
        // Represent delta as a generalized variable-length integer.
        let q = delta;
        for (let k = base; ; k += base) {
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (q < t) {
            break;
          }
          const qMinusT = q - t;
          const baseMinusT = base - t;
          output.push(String.fromCharCode(digitToBasic(t + (qMinusT % baseMinusT), 0)));
          q = Math.floor(qMinusT / baseMinusT);
        }

        output.push(String.fromCharCode(digitToBasic(q, 0)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }

    ++delta;
    ++n;
  }

  return ParseResult.succeed(output.join(""));
};
