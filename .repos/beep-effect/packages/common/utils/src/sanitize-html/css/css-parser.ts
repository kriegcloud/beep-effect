/**
 * CSS style attribute parser
 *
 * Parses inline CSS style attributes into property-value pairs.
 *
 * @since 0.1.0
 * @module
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

/**
 * A CSS declaration (property-value pair).
 *
 * @since 0.1.0
 * @category types
 */
export interface CssDeclaration {
  readonly property: string;
  readonly value: string;
  readonly important: boolean;
}

/**
 * State for parsing style declarations character by character.
 */
interface ParseState {
  readonly declarations: readonly string[];
  readonly current: string;
  readonly parenDepth: number;
  readonly inString: string | null;
}

/**
 * Character context for parsing decisions.
 */
interface CharContext {
  readonly char: string;
  readonly prevChar: string;
  readonly state: ParseState;
}

const initialParseState: ParseState = {
  declarations: [],
  current: "",
  parenDepth: 0,
  inString: null,
};

/**
 * Check if a character is a quote character.
 */
const isQuoteChar = (char: string): char is '"' | "'" => char === '"' || char === "'";

/**
 * Check if a character is escaped.
 */
const isEscaped = (prevChar: string): boolean => prevChar === "\\";

/**
 * Process a quote character in the parse state.
 */
const processQuote = (ctx: CharContext): ParseState => {
  const { char, state } = ctx;

  return F.pipe(
    state.inString,
    O.fromNullable,
    O.match({
      // Not in a string, start one
      onNone: () => ({
        ...state,
        current: Str.concat(state.current, char),
        inString: char,
      }),
      // In a string, check if we're closing it
      onSome: (currentQuote) =>
        currentQuote === char
          ? {
              ...state,
              current: Str.concat(state.current, char),
              inString: null,
            }
          : {
              ...state,
              current: Str.concat(state.current, char),
            },
    })
  );
};

/**
 * Process a regular character (not in string context).
 */
const processRegularChar = (ctx: CharContext): ParseState => {
  const { char, state } = ctx;

  return F.pipe(
    Match.value(char),
    Match.when("(", () => ({
      ...state,
      current: Str.concat(state.current, char),
      parenDepth: state.parenDepth + 1,
    })),
    Match.when(")", () => ({
      ...state,
      current: Str.concat(state.current, char),
      parenDepth: Math.max(0, state.parenDepth - 1),
    })),
    Match.when(";", () =>
      state.parenDepth === 0
        ? {
            declarations:
              F.pipe(state.current, Str.trim, Str.length) > 0
                ? A.append(state.declarations, state.current)
                : state.declarations,
            current: "",
            parenDepth: 0,
            inString: null,
          }
        : {
            ...state,
            current: Str.concat(state.current, char),
          }
    ),
    Match.orElse(() => ({
      ...state,
      current: Str.concat(state.current, char),
    }))
  );
};

/**
 * Process a single character in the parsing state machine.
 */
const processChar = (state: ParseState, char: string, index: number, chars: readonly string[]): ParseState => {
  const prevChar = index > 0 ? (chars[index - 1] ?? "") : "";
  const ctx: CharContext = { char, prevChar, state };

  // If we're inside a string, just accumulate
  if (P.isNotNull(state.inString)) {
    // Check if this quote closes the string
    if (isQuoteChar(char) && !isEscaped(prevChar) && state.inString === char) {
      return {
        ...state,
        current: Str.concat(state.current, char),
        inString: null,
      };
    }
    return {
      ...state,
      current: Str.concat(state.current, char),
    };
  }

  // Handle quote characters that start a string
  if (isQuoteChar(char) && !isEscaped(prevChar)) {
    return processQuote(ctx);
  }

  // Handle regular characters
  return processRegularChar(ctx);
};

/**
 * Finalize the parse state by adding any remaining content.
 */
const finalizeState = (state: ParseState): readonly string[] =>
  F.pipe(state.current, Str.trim, Str.length) > 0 ? A.append(state.declarations, state.current) : state.declarations;

/**
 * Split style string into individual declarations.
 * Handles url() and other function values that may contain semicolons.
 */
const splitStyleDeclarations = (style: string): readonly string[] => {
  const chars = Str.split(style, "");

  return F.pipe(
    chars,
    A.reduce({ state: initialParseState, index: 0 }, (acc, char) => ({
      state: processChar(acc.state, char, acc.index, chars),
      index: acc.index + 1,
    })),
    (result) => finalizeState(result.state)
  );
};

/**
 * Find the index of a character in a string, returning Option.
 */
const findCharIndex = (str: string, char: string): O.Option<number> => {
  const index = str.indexOf(char);
  return index >= 0 ? O.some(index) : O.none();
};

/**
 * Extract property and value from a declaration string given a colon index.
 */
const extractPropertyValue = (trimmed: string, colonIndex: number): O.Option<{ property: string; value: string }> => {
  const property = F.pipe(trimmed, Str.slice(0, colonIndex), Str.trim, Str.toLowerCase);

  const value = F.pipe(trimmed, Str.slice(colonIndex + 1), Str.trim);

  // Return None if either property or value is empty
  return Str.length(property) > 0 && Str.length(value) > 0 ? O.some({ property, value }) : O.none();
};

/**
 * Check if a value ends with !important and extract the clean value.
 */
const parseImportant = (value: string): { value: string; important: boolean } => {
  const importantPattern = /\s*!important\s*$/i;
  const hasImportant = importantPattern.test(value);

  return hasImportant
    ? {
        value: F.pipe(value, Str.replace(importantPattern, ""), Str.trim),
        important: true,
      }
    : { value, important: false };
};

/**
 * Parse a single CSS declaration.
 * Returns None if the declaration is invalid.
 */
const parseDeclaration = (decl: string): O.Option<CssDeclaration> => {
  const trimmed = Str.trim(decl);

  return F.pipe(
    trimmed,
    O.liftPredicate((t) => Str.length(t) > 0),
    O.flatMap((t) =>
      F.pipe(
        findCharIndex(t, ":"),
        O.filter((idx) => idx > 0),
        O.flatMap((colonIndex) => extractPropertyValue(t, colonIndex))
      )
    ),
    O.map(({ property, value }) => {
      const { value: cleanValue, important } = parseImportant(value);
      return Str.length(cleanValue) > 0 ? O.some({ property, value: cleanValue, important }) : O.none();
    }),
    O.flatten
  );
};

/**
 * Parse inline style attribute into CSS declarations.
 *
 * @example
 * ```typescript
 * import { parseStyleAttribute } from "@beep/utils/sanitize-html/css/css-parser"
 *
 * const declarations = parseStyleAttribute("color: red; font-size: 14px !important;")
 * // [
 * //   { property: "color", value: "red", important: false },
 * //   { property: "font-size", value: "14px", important: true }
 * // ]
 * ```
 *
 * @since 0.1.0
 * @category parsing
 */
export const parseStyleAttribute = (style: string): readonly CssDeclaration[] =>
  F.pipe(
    style,
    // Split by semicolons, but handle url() which may contain semicolons
    splitStyleDeclarations,
    A.filterMap(parseDeclaration)
  );

/**
 * Format a single declaration to string.
 */
const formatDeclaration = (decl: CssDeclaration): string =>
  decl.important ? `${decl.property}:${decl.value} !important` : `${decl.property}:${decl.value}`;

/**
 * Stringify CSS declarations back to inline style format.
 *
 * @example
 * ```typescript
 * import { stringifyDeclarations } from "@beep/utils/sanitize-html/css/css-parser"
 *
 * const style = stringifyDeclarations([
 *   { property: "color", value: "red", important: false },
 *   { property: "font-size", value: "14px", important: true }
 * ])
 * // "color:red;font-size:14px !important"
 * ```
 *
 * @since 0.1.0
 * @category serialization
 */
export const stringifyDeclarations = (declarations: readonly CssDeclaration[]): string =>
  F.pipe(declarations, A.map(formatDeclaration), A.join(";"));

/**
 * Dangerous CSS patterns that can execute scripts or load external content.
 */
const dangerousPatterns = [
  // javascript: in url()
  /url\s*\(\s*["']?\s*javascript:/i,
  // data: URLs (can contain scripts in SVG)
  /url\s*\(\s*["']?\s*data:/i,
  // expression() (IE-specific, executes JS)
  /expression\s*\(/i,
  // behavior: (IE-specific, loads HTC files)
  /behavior\s*:/i,
  // -moz-binding (Firefox-specific, can load XBL)
  /-moz-binding\s*:/i,
] as const;

/**
 * Normalize a CSS value for security checking.
 */
const normalizeCssValue = (value: string): string =>
  F.pipe(
    value,
    Str.toLowerCase,
    // Remove whitespace and control characters
    Str.replace(/[\s\x00-\x1f]/g, "")
  );

/**
 * Check if a normalized value matches any dangerous pattern.
 */
const matchesDangerousPattern = (normalized: string): boolean =>
  F.pipe(
    dangerousPatterns,
    A.some((pattern) => pattern.test(normalized))
  );

/**
 * Check if a CSS value potentially contains dangerous content.
 * This includes javascript:, expression(), and behavior:.
 *
 * @example
 * ```typescript
 * import { isDangerousCssValue } from "@beep/utils/sanitize-html/css/css-parser"
 *
 * isDangerousCssValue("url(javascript:alert(1))") // true
 * isDangerousCssValue("expression(alert(1))") // true
 * isDangerousCssValue("url(https://example.com/img.png)") // false
 * ```
 *
 * @since 0.1.0
 * @category security
 */
export const isDangerousCssValue = (value: string): boolean =>
  F.pipe(value, normalizeCssValue, matchesDangerousPattern);
