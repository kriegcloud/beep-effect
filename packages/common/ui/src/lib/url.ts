/**
 * URL sanitization helpers for UI navigation.
 *
 * @since 0.0.0
 * @module
 */

const unsafeHrefProtocolPattern = /^(?:javascript|vbscript|data):/i;
const ignoredProtocolCharactersPattern = /[\u0000-\u001f\u007f\s]+/g;
const htmlCharacterReferencePattern = /&(?:#(\d+);?|#x([\da-f]+);?|(colon|tab|newline);?)/gi;
const percentEncodedBytePattern = /%([0-9a-f]{2})/gi;
const maxUnicodeCodePoint = 0x10ffff;
const maxDecodePasses = 4;

const isValidCodePoint = (codePoint: number): boolean => codePoint >= 0 && codePoint <= maxUnicodeCodePoint;

const toCodePointString = (codePoint: number): string =>
  isValidCodePoint(codePoint) ? globalThis.String.fromCodePoint(codePoint) : "";

const decodeHtmlCharacterReferences = (value: string): string =>
  value.replace(
    htmlCharacterReferencePattern,
    (match: string, decimal: string | undefined, hexadecimal: string | undefined, named: string | undefined) => {
      if (typeof named === "string") {
        const normalizedNamed = named.toLowerCase();
        const namedCodePoint = normalizedNamed === "tab" ? 9 : normalizedNamed === "newline" ? 10 : 58;
        return toCodePointString(namedCodePoint);
      }

      const numericValue = typeof hexadecimal === "string" ? hexadecimal : decimal;
      if (typeof numericValue !== "string") {
        return match;
      }

      const radix = typeof hexadecimal === "string" ? 16 : 10;
      const codePoint = globalThis.Number.parseInt(numericValue, radix);

      return isValidCodePoint(codePoint) ? globalThis.String.fromCodePoint(codePoint) : match;
    }
  );

// ASCII-oriented decoding is enough for protocol detection because the blocked
// scheme names are ASCII-only. We intentionally normalize obfuscated prefixes
// rather than fully decode arbitrary UTF-8 payloads here.
const decodePercentEncodedBytes = (value: string): string => {
  let decoded = value;

  for (let pass = 0; pass < maxDecodePasses; pass++) {
    const next = decoded.replace(percentEncodedBytePattern, (_match: string, hex: string) =>
      globalThis.String.fromCodePoint(globalThis.Number.parseInt(hex, 16))
    );

    if (next === decoded) {
      return next;
    }

    decoded = next;
  }

  return decoded;
};

const normalizeHrefProtocolCandidate = (value: string): string =>
  value.trim().replace(ignoredProtocolCharactersPattern, "").toLowerCase();

/**
 * Replaces active script URL protocols with a harmless fragment.
 *
 * The original href is preserved for safe schemes and relative navigation.
 *
 * @since 0.0.0
 * @category Utility
 */
export const sanitizeAnchorHref = (href: string): string => {
  const decodedHtml = decodeHtmlCharacterReferences(href);
  const decodedPercent = decodePercentEncodedBytes(href);
  const decodedHtmlAndPercent = decodePercentEncodedBytes(decodedHtml);
  const decodedPercentAndHtml = decodeHtmlCharacterReferences(decodedPercent);
  const candidates = [href, decodedHtml, decodedPercent, decodedHtmlAndPercent, decodedPercentAndHtml];

  return candidates.some((candidate) => unsafeHrefProtocolPattern.test(normalizeHrefProtocolCandidate(candidate)))
    ? "#"
    : href;
};
