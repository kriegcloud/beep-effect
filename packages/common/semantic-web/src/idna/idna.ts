import { BS } from "@beep/schema";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { IDNAError } from "./errors.ts";
import type { DomainCallback, MapCallback } from "./model.ts";
import { IDNAConfig, UCS2 } from "./model.ts";
/** Highest positive signed 32-bit float value */
export const maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128; // 0x80
const delimiter = "-"; // '\x2D'

/** Regular expressions */
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/; // Note: U+007F DEL is excluded too.
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
const baseMinusTMin = base - tMin;
/**
 * A generic `Array#map` utility function.
 * @private
 * @param array The array to iterate over.
 * @param callback The function that gets called for every array item.
 * @returns A new array of values returned by the callback function.
 */
export function map<T, R>(array: T[], callback: MapCallback<T, R>): R[] {
  const result = A.empty<R>();
  let length = array.length;
  while (length--) {
    const elemOpt = A.get(length)(array);
    if (O.isSome(elemOpt)) {
      const elem = elemOpt.value;
      result[length] = callback(elem, length, array);
    }
  }
  return result;
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param domain The domain name or email address.
 * @param callback The function that gets called for every character.
 * @returns A new string of characters returned by the callback function.
 */
export function mapDomain(domain: string, callback: DomainCallback): string {
  const parts = Str.split(domain, "@");
  let result = "";
  // In email addresses, only the domain name should be punycoded. Leave
  // the local part (i.e. everything up to `@`) intact.
  const tailOpt = A.get(1)(parts);
  if (O.isSome(tailOpt)) {
    result = `${parts[0]}@`;
    domain = tailOpt.value;
  }
  // Avoid `split(regex)` for IE8 compatibility. See #17.
  domain = Str.replace(regexSeparators, "\x2E")(domain);
  const labels = Str.split(".")(domain);
  const encoded = A.join(".")(map(labels, callback));
  return result + encoded;
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @name decode
 * @param string The Unicode input string (UCS-2).
 * @returns The new array of code points.
 */
export function ucs2decode(string: string): number[] {
  const output = A.empty<number>();
  let counter = 0;
  const length = string.length;
  while (counter < length) {
    const value = string.charCodeAt(counter++);
    if (value >= 0xd800 && value <= 0xdbff && counter < length) {
      // It's a high surrogate, and there is a next character.
      const extra = string.charCodeAt(counter++);
      if ((extra & 0xfc00) === 0xdc00) {
        // Low surrogate.
        output.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}

/**
 * Creates a string based on an array of numeric code points.
 * @name encode
 * @param codePoints The array of numeric code points.
 * @returns The new Unicode string (UCS-2).
 */
export function ucs2encode(codePoints: number[]): string {
  return String.fromCodePoint(...codePoints);
}

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param codePoint The basic numeric code point value.
 * @returns The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */
export function basicToDigit(codePoint: number): number {
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
}

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param digit The numeric value of a basic code point.
 * @param flag Whether to use uppercase (non-zero) or lowercase (zero).
 * @returns The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */
export function digitToBasic(digit: number, flag: number): number {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * Number(digit < 26) - ((flag !== 0 ? 1 : 0) << 5);
}

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
export function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let k = 0;
  delta = firstTime ? Math.floor(delta / damp) : delta >> 1;
  delta += Math.floor(delta / numPoints);
  for (; /* no initialization */ delta > (baseMinusTMin * tMax) >> 1; k += base) {
    delta = Math.floor(delta / baseMinusTMin);
  }
  return Math.floor(k + ((baseMinusTMin + 1) * delta) / (delta + skew));
}

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param input The Punycode string of ASCII-only symbols.
 * @returns The resulting string of Unicode symbols.
 */
export function decode(input: string): string {
  // Don't use UCS-2.
  const output: number[] = [];
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
    // if it's not a basic code point
    if (input.charCodeAt(j) >= 0x80) {
      throw IDNAError.new(`${input.charCodeAt(j)} >= 0x80`)("not-basic");
    }
    output.push(input.charCodeAt(j));
  }

  // Main decoding loop: start just after the last delimiter if any basic code
  // points were copied; start at the beginning otherwise.

  for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) /* no final expression */ {
    // `index` is the index of the next character to be consumed.
    // Decode a generalized variable-length integer into `delta`,
    // which gets added to `i`. The overflow checking is easier
    // if we increase `i` as we go, then subtract off its starting
    // value at the end to obtain `delta`.
    const oldi = i;
    for (let w = 1, k = base; ; /* no condition */ k += base) {
      if (index >= inputLength) {
        throw IDNAError.new({ index, inputLength })("invalid-input");
      }

      const digit = basicToDigit(input.charCodeAt(index++));

      if (digit >= base) {
        throw IDNAError.new({ digit, base })("invalid-input");
      }
      if (digit > Math.floor((maxInt - i) / w)) {
        throw IDNAError.new(digit)("overflow");
      }

      i += digit * w;
      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

      if (digit < t) {
        break;
      }

      const baseMinusT = base - t;
      if (w > Math.floor(maxInt / baseMinusT)) {
        throw IDNAError.new(`${w} > ${Math.floor(maxInt / baseMinusT)}`)("overflow");
      }

      w *= baseMinusT;
    }

    const out = output.length + 1;
    bias = adapt(i - oldi, out, oldi === 0);

    // `i` was supposed to wrap around from `out` to `0`,
    // incrementing `n` each time, so we'll fix that now:
    if (Math.floor(i / out) > maxInt - n) {
      throw IDNAError.new(Math.floor(i / out))("overflow");
    }

    n += Math.floor(i / out);
    i %= out;

    // Insert `n` at position `i` of the output.
    output.splice(i++, 0, n);
  }

  return String.fromCodePoint(...output);
}

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param input The string of Unicode symbols.
 * @returns The resulting Punycode string of ASCII-only symbols.
 */
export function encode(input: string): string {
  const output: string[] = [];

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

  // `handledCPCount` is the number of code points that have been handled;
  // `basicLength` is the number of basic code points.

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    output.push(delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next
    // larger one:
    let m = maxInt;
    for (const currentValue of inputArray) {
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
    // but guard against overflow.
    const handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > Math.floor((maxInt - delta) / handledCPCountPlusOne)) {
      throw IDNAError.new({ m, n, delta })("overflow");
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (const currentValue of inputArray) {
      if (currentValue < n && ++delta > maxInt) {
        throw IDNAError.new(currentValue)("overflow");
      }
      if (currentValue === n) {
        // Represent delta as a generalized variable-length integer.
        let q = delta;
        for (let k = base; ; /* no condition */ k += base) {
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
  return output.join("");
}

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 * @param input The Punycoded domain name or email address to
 * convert to Unicode.
 * @returns The Unicode representation of the given Punycode string.
 */
export function toUnicode(input: string): string {
  return mapDomain(input, (string) => {
    return regexPunycode.test(string) ? decode(pipe(string, Str.slice(4), Str.toLowerCase)) : string;
  });
}

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @param input The domain name or email address to convert, as a
 * Unicode string.
 * @returns The Punycode representation of the given domain name or
 * email address.
 */
export function toASCII(input: string): string {
  return mapDomain(input, (string) => {
    return regexNonASCII.test(string) ? `xn--${encode(string)}` : string;
  });
}

export const IDNA = new IDNAConfig({
  /**
   * A string representing the current Punycode.js version number.
   */
  version: BS.SemanticVersion.make("0.1.0"),
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   */
  ucs2: new UCS2({
    decode: ucs2decode,
    encode: ucs2encode,
  }),
  decode,
  encode,
  toASCII,
  toUnicode,
});

export default IDNA;
