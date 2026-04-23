/**
 * Shared Markdown and HTML rendering utilities.
 *
 * @module @beep/md/Md.utils
 * @since 0.0.0
 */

import { $MdId } from "@beep/identity";
import { Markdown } from "@beep/schema";
import { Html, Str } from "@beep/utils";
import { Number as N } from "effect";
import * as A from "effect/Array";
import { dual, flow, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $MdId.create("Md.utils");
const trimBlock = Str.replace(/^\n+|\n+$/g, "");
// Only active script protocols are blocked by default.
// file:, blob:, and filesystem: are intentionally not treated as execution sinks in this boundary.
const unsafeUrlProtocolPattern = /^(?:javascript|vbscript|data):/i;
const urlProtocolDetectionIgnoredPattern = /[\u0000-\u001f\u007f\s]+/g;
const htmlCharacterReferencePattern = /&(?:#(\d+);?|#x([\da-f]+);?|(colon|tab|newline);?)/gi;
const percentEncodedBytePattern = /%([0-9a-f]{2})/gi;
const percentEncodedOctetPattern = /%25([0-9a-f]{2})/gi;
const invalidSurrogatePattern = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
const codeFenceLanguagePattern = /^[A-Za-z0-9][A-Za-z0-9_+.-]*$/;
const lineSeparatorPattern = /\r\n?|\n/;
const lineBreakPattern = /[\r\n]/;
const maxUnicodeCodePoint = 0x10ffff;
const maxUrlDecodePasses = 4;

const StringArray = S.Array(S.String).pipe(
  $I.annoteSchema("StringArray", {
    description: "Rendered string array accepted by Markdown utility helpers.",
  })
);
const UnsafeUrlProtocolDestination = S.String.check(
  S.isPattern(unsafeUrlProtocolPattern, {
    identifier: $I`UnsafeUrlProtocolDestinationCheck`,
    title: "Unsafe URL Protocol Destination",
    description: "A normalized URL destination that starts with an active unsafe protocol.",
    message: "URL destination must not start with javascript:, vbscript:, or data:",
  })
).pipe(
  $I.annoteSchema("UnsafeUrlProtocolDestination", {
    description: "Normalized URL destination that starts with an active unsafe protocol.",
  })
);
const CodeFenceLanguage = S.NonEmptyString.check(
  S.isPattern(codeFenceLanguagePattern, {
    identifier: $I`CodeFenceLanguageCheck`,
    title: "Code Fence Language",
    description: "A single safe Markdown fenced-code info-string token.",
    message: "Code fence language must be a single alphanumeric token with _, +, ., or - separators",
  })
).pipe(
  $I.annoteSchema("CodeFenceLanguage", {
    description: "Single safe Markdown fenced-code info-string token.",
  })
);

const isUnsafeUrlProtocolDestination = S.is(UnsafeUrlProtocolDestination);
const isCodeFenceLanguage = S.is(CodeFenceLanguage);

const isValidCodePoint = (codePoint: number): boolean => codePoint >= 0 && codePoint <= maxUnicodeCodePoint;
const parseCodePoint = (value: string, radix: 10 | 16): number => globalThis.Number.parseInt(value, radix);
const codePointToString = (codePoint: number): string => globalThis.String.fromCodePoint(codePoint);
const replaceHtmlCharacterReferences = (
  value: string,
  replacer: (
    match: string,
    decimal: string | undefined,
    hexadecimal: string | undefined,
    named: string | undefined
  ) => string
): string => value.replace(htmlCharacterReferencePattern, replacer);

const decodeHtmlCharacterReferences = (value: string): string =>
  replaceHtmlCharacterReferences(
    value,
    (_match, decimal: string | undefined, hexadecimal: string | undefined, named: string | undefined) => {
      const normalizedNamed = P.isString(named) ? Str.toLowerCase(named) : "";
      const codePoint = P.isString(named)
        ? normalizedNamed === "tab"
          ? 9
          : normalizedNamed === "newline"
            ? 10
            : 58
        : P.isString(hexadecimal)
          ? parseCodePoint(hexadecimal, 16)
          : parseCodePoint(O.getOrThrow(O.fromUndefinedOr(decimal)), 10);

      return isValidCodePoint(codePoint) ? codePointToString(codePoint) : _match;
    }
  );

const decodePercentEncodedByte = (value: string): string =>
  value.replace(percentEncodedBytePattern, (_match, hex: string) => codePointToString(parseCodePoint(hex, 16)));

const decodePercentEncodedBytes = (value: string): string => {
  let decoded = value;

  for (let pass = 0; pass < maxUrlDecodePasses; pass++) {
    const next = decodePercentEncodedByte(decoded);

    if (next === decoded) {
      return next;
    }

    decoded = next;
  }

  return decoded;
};

const normalizeUrlProtocolCandidate = flow(
  Str.trim,
  Str.replace(urlProtocolDetectionIgnoredPattern, ""),
  Str.toLowerCase
);

const encodeUrlDestination = flow(
  Str.replace(invalidSurrogatePattern, "\uFFFD"),
  encodeURI,
  Str.replace(percentEncodedOctetPattern, "%$1")
);

/**
 * Joins rendered Markdown blocks with one blank line between blocks.
 *
 * @example
 * ```ts
 * import { joinBlocks } from "@beep/md/Md.utils"
 *
 * const markdown = joinBlocks(["# Title", "Body text"])
 * console.log(markdown) // "# Title\n\nBody text"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const joinBlocks = (blocks: string | ReadonlyArray<string>): Markdown => {
  const blockList = P.isString(blocks) ? [blocks] : blocks;

  return pipe(blockList, A.map(trimBlock), A.filter(P.isTruthy), A.join("\n\n"), Markdown.make);
};

/**
 * Prefixes every line of text with the provided marker.
 *
 * @example
 * ```ts
 * import { prefixLines } from "@beep/md/Md.utils"
 *
 * const quoted = prefixLines("alpha\nbeta", "> ")
 * console.log(quoted) // "> alpha\n> beta"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const prefixLines: {
  (text: string, prefix: string): string;
  (prefix: string): (text: string) => string;
} = dual(2, (text: string, prefix: string): string =>
  pipe(text, Str.split(lineSeparatorPattern), A.map(Str.prefix(prefix)), A.join("\n"))
);

/**
 * Escapes Markdown control characters in plain text.
 *
 * @example
 * ```ts
 * import { escapeMarkdownText } from "@beep/md/Md.utils"
 *
 * const escaped = escapeMarkdownText("# title")
 * console.log(escaped) // "\\# title"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const escapeMarkdownText = Str.replace(/([\\`*_{}[\]()#+\-.|<>~])/g, "\\$1");

/**
 * Normalizes URL-like destinations before rendering Markdown or HTML output.
 *
 * Unsafe active protocols are replaced with a harmless fragment destination.
 *
 * @example
 * ```ts
 * import { sanitizeUrlDestination } from "@beep/md/Md.utils"
 *
 * console.log(sanitizeUrlDestination("javascript:alert(1)")) // "#"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const sanitizeUrlDestination = (destination: string): string => {
  const decodedHtml = decodeHtmlCharacterReferences(destination);
  const decodedPercent = decodePercentEncodedBytes(destination);
  const decodedHtmlAndPercent = decodePercentEncodedBytes(decodedHtml);
  const candidates = [destination, decodedHtml, decodedPercent, decodedHtmlAndPercent];

  // Evaluate normalized/decoded candidates, but preserve the original destination when safe.
  return pipe(candidates, A.map(normalizeUrlProtocolCandidate), A.some(isUnsafeUrlProtocolDestination))
    ? "#"
    : destination;
};

/**
 * Escapes Markdown link or image destination delimiters.
 *
 * @example
 * ```ts
 * import { escapeMarkdownDestination } from "@beep/md/Md.utils"
 *
 * const escaped = escapeMarkdownDestination("https://example.com/a)b")
 * console.log(escaped) // "https://example.com/a\\)b"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const escapeMarkdownDestination = flow(
  sanitizeUrlDestination,
  encodeUrlDestination,
  Str.replace(/[\\()]/g, "\\$&")
);

/**
 * Escapes a URL-like destination for use inside an HTML attribute.
 *
 * @example
 * ```ts
 * import { escapeHtmlUrlAttribute } from "@beep/md/Md.utils"
 *
 * console.log(escapeHtmlUrlAttribute("a b")) // "a%20b"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const escapeHtmlUrlAttribute = flow(sanitizeUrlDestination, encodeUrlDestination, Html.escapeHtml);

/**
 * Sanitizes Markdown fenced-code info strings to a single language token.
 *
 * Invalid language values are omitted instead of being rendered into the fence.
 *
 * @example
 * ```ts
 * import { sanitizeCodeFenceLanguage } from "@beep/md/Md.utils"
 *
 * console.log(sanitizeCodeFenceLanguage("ts")) // "ts"
 * console.log(sanitizeCodeFenceLanguage("ts bad")) // ""
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const sanitizeCodeFenceLanguage = (language: string): string => {
  const trimmed = Str.trim(language);

  return isCodeFenceLanguage(trimmed) ? trimmed : "";
};

/**
 * Returns the length of the longest contiguous backtick run in text.
 *
 * @example
 * ```ts
 * import { maxBackticks } from "@beep/md/Md.utils"
 *
 * const triple = "`".repeat(3)
 * const count = maxBackticks(`\`one\` and ${triple}three${triple}`)
 * console.log(count) // 3
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const maxBackticks = (text: string): number => {
  let max = 0;
  let current = 0;

  for (let index = 0; index < text.length; index++) {
    if (text[index] === "`") {
      current++;
      max = N.max(max, current);
    } else {
      current = 0;
    }
  }

  return max;
};

/**
 * Builds a Markdown inline code span with an adaptive backtick fence.
 *
 * @example
 * ```ts
 * import { renderInlineCode } from "@beep/md/Md.utils"
 *
 * const code = renderInlineCode("`single`")
 * console.log(code) // "`` `single` ``"
 * ```
 *
 * Empty and multiline payloads fall back to raw `<code>` HTML because Markdown
 * code spans normalize whitespace and cannot preserve those payloads exactly.
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderInlineCode = (text: string): string => {
  if (text === "" || lineBreakPattern.test(text)) {
    // Preserve exact payload for empty/multiline spans instead of lossy Markdown normalization.
    return `<code>${Html.escapeHtml(text)}</code>`;
  }

  const backticks = pipe("`", Str.repeat(maxBackticks(text) + 1));
  const needsPadding =
    Str.startsWith("`")(text) || Str.endsWith("`")(text) || Str.startsWith(" ")(text) || Str.endsWith(" ")(text);
  const padding = needsPadding ? " " : "";

  return `${backticks}${padding}${text}${padding}${backticks}`;
};

/**
 * Builds a Markdown fenced code block with an adaptive backtick fence.
 *
 * @example
 * ```ts
 * import { renderFencedCode } from "@beep/md/Md.utils"
 *
 * const block = renderFencedCode("console.log('beep')", "ts")
 * const fence = "`".repeat(3)
 * console.log(block.includes(`${fence}ts`)) // true
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderFencedCode = (text: string, language: string): string => {
  const fence = pipe("`", Str.repeat(N.max(maxBackticks(text), 2) + 1));
  const info = sanitizeCodeFenceLanguage(language);

  return `${fence}${info}\n${text}\n${fence}`;
};

/**
 * Type guard for rendered string arrays accepted by {@link joinBlocks}.
 *
 * @example
 * ```ts
 * import { isStringArray } from "@beep/md/Md.utils"
 *
 * console.log(isStringArray(["a", "b"])) // true
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isStringArray = S.is(StringArray);
