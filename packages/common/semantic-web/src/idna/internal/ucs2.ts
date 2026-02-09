/**
 * UCS-2 / UTF-16 helpers used by the punycode algorithm.
 *
 * This is a direct, small extraction of the legacy implementation to keep
 * behavior identical (including unmatched surrogate handling).
 */

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
export const ucs2decode = (input: string): ReadonlyArray<number> => {
  const output: Array<number> = [];
  let counter = 0;
  const length = input.length;

  while (counter < length) {
    const value = input.charCodeAt(counter++);

    // High surrogate, and there is a next character.
    if (value >= 0xd800 && value <= 0xdbff && counter < length) {
      const extra = input.charCodeAt(counter++);

      if ((extra & 0xfc00) === 0xdc00) {
        // Low surrogate.
        output.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
      } else {
        // Unmatched surrogate; append the high surrogate and step back so the
        // next code unit can be processed normally.
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }

  return output;
};

/**
 * Creates a string based on an array of numeric code points.
 */
export const ucs2encode = (codePoints: ReadonlyArray<number>): string => {
  // Intentionally uses `fromCodePoint` to mirror the legacy implementation.
  // This is safe for the existing test corpus and keeps behavior identical.
  return String.fromCodePoint(...codePoints);
};

