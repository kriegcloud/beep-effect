/**
 * srcset attribute parser
 *
 * Parses and validates HTML srcset attributes.
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

import { isNaughtyHref, type UrlValidationOptions } from "./url-validator.js";

/**
 * A single entry in a srcset attribute.
 *
 * @since 0.1.0
 * @category types
 */
export interface SrcsetEntry {
  [key: string]: unknown;
  readonly url: string;
  readonly width?: undefined | number;
  readonly height?: undefined | number;
  readonly density?: undefined | number;
}

/**
 * Type for descriptor suffix
 */
type DescriptorSuffix = "w" | "h" | "x";

/**
 * Check if character is whitespace
 */
const isWhitespace = (char: string): boolean => /\s/.test(char);

/**
 * Check if a number is valid (finite and positive)
 */
const isValidPositiveNumber = (n: number): boolean => Number.isFinite(n) && !Number.isNaN(n) && n > 0;

/**
 * Parse a descriptor suffix into its type
 */
const getDescriptorType = (desc: string): O.Option<DescriptorSuffix> =>
  F.pipe(
    Match.value(desc),
    Match.when(Str.endsWith("w"), () => O.some("w" as const)),
    Match.when(Str.endsWith("h"), () => O.some("h" as const)),
    Match.when(Str.endsWith("x"), () => O.some("x" as const)),
    Match.orElse(() => O.none())
  );

/**
 * Parse descriptor value (removes suffix and parses number)
 */
const parseDescriptorValue = (desc: string): O.Option<number> =>
  F.pipe(Str.slice(0, -1)(desc), Number.parseFloat, O.liftPredicate(isValidPositiveNumber));

/**
 * Apply a descriptor to an entry based on its type
 */
const applyDescriptor = (entry: Record<string, unknown>, desc: string): Record<string, unknown> =>
  F.pipe(
    getDescriptorType(desc),
    O.flatMap((type) =>
      F.pipe(
        parseDescriptorValue(desc),
        O.map((value) =>
          F.pipe(
            Match.value(type),
            Match.when("w", () => ({ ...entry, width: value })),
            Match.when("h", () => ({ ...entry, height: value })),
            Match.when("x", () => ({ ...entry, density: value })),
            Match.exhaustive
          )
        )
      )
    ),
    O.getOrElse(() => entry)
  );

/**
 * Character processing state for srcset splitting
 */
interface SplitState {
  readonly candidates: readonly string[];
  readonly current: string;
  readonly inUrl: boolean;
}

/**
 * Process a comma character in srcset splitting
 */
const processComma = (state: SplitState, char: string): SplitState =>
  state.inUrl || Str.isEmpty(Str.trim(state.current))
    ? { ...state, current: Str.concat(state.current, char) }
    : {
        candidates: A.append(state.candidates, Str.trim(state.current)),
        current: "",
        inUrl: true,
      };

/**
 * Process a whitespace character in srcset splitting
 */
const processWhitespace = (state: SplitState, char: string): SplitState => ({
  ...state,
  current: Str.concat(state.current, char),
  inUrl: Str.isEmpty(Str.trim(state.current)) ? state.inUrl : false,
});

/**
 * Process a regular character in srcset splitting
 */
const processRegularChar = (state: SplitState, char: string): SplitState => ({
  ...state,
  current: Str.concat(state.current, char),
});

/**
 * Process a single character in srcset splitting
 */
const processChar = (state: SplitState, char: string): SplitState =>
  F.pipe(
    Match.value(char),
    Match.when(",", () => processComma(state, char)),
    Match.when(P.isString, (c) => (isWhitespace(c) ? processWhitespace(state, c) : processRegularChar(state, c))),
    Match.exhaustive
  );

/**
 * Split srcset string into individual candidate strings.
 * Handles URLs that may contain commas (e.g., in query strings).
 */
const splitSrcset = (srcset: string): readonly string[] => {
  const chars = Str.split(srcset, "");
  const initialState: SplitState = { candidates: [], current: "", inUrl: true };

  const finalState = A.reduce(chars, initialState, processChar);
  const trimmedFinal = Str.trim(finalState.current);

  return Str.isEmpty(trimmedFinal) ? finalState.candidates : A.append(finalState.candidates, trimmedFinal);
};

/**
 * Parse srcset attribute into individual entries.
 *
 * The srcset attribute contains one or more image candidate strings,
 * separated by commas. Each candidate has a URL and optional width (w),
 * height (h), or density (x) descriptors.
 *
 * @example
 * ```typescript
 * import { parseSrcset } from "@beep/utils/sanitize-html/url/srcset-parser"
 *
 * parseSrcset("small.jpg 100w, medium.jpg 200w, large.jpg 300w")
 * // [
 * //   { url: "small.jpg", width: 100 },
 * //   { url: "medium.jpg", width: 200 },
 * //   { url: "large.jpg", width: 300 }
 * // ]
 *
 * parseSrcset("image.jpg 1x, image@2x.jpg 2x")
 * // [
 * //   { url: "image.jpg", density: 1 },
 * //   { url: "image@2x.jpg", density: 2 }
 * // ]
 * ```
 *
 * @since 0.1.0
 * @category parsing
 */
export const parseSrcset = (srcset: string): readonly SrcsetEntry[] => {
  const candidates = splitSrcset(srcset);
  return A.filterMap(candidates, parseCandidate);
};

/**
 * Split a string by whitespace using regex pattern
 */
const splitByWhitespace = (s: string): readonly string[] => F.pipe(s, Str.split(/\s+/), A.filter(P.not(Str.isEmpty)));

/**
 * Parse a single srcset candidate string.
 */
const parseCandidate = (candidate: string): O.Option<SrcsetEntry> => {
  const trimmed = Str.trim(candidate);

  return F.pipe(
    trimmed,
    O.liftPredicate(P.not(Str.isEmpty)),
    O.flatMap((t) =>
      F.pipe(
        splitByWhitespace(t),
        A.head,
        O.filter(P.not(Str.isEmpty)),
        O.map((url) => {
          const parts = splitByWhitespace(t);
          const descriptors = A.drop(parts, 1);

          const baseEntry: Record<string, unknown> = { url };
          const entry = A.reduce(descriptors, baseEntry, applyDescriptor);

          return entry as SrcsetEntry;
        })
      )
    )
  );
};

/**
 * Append optional descriptor to parts array
 */
const appendOptional = <T>(parts: readonly string[], value: T | undefined, suffix: string): readonly string[] =>
  F.pipe(
    O.fromNullable(value),
    O.map((v) => `${v}${suffix}`),
    O.match({
      onNone: () => parts,
      onSome: (s) => A.append(parts, s),
    })
  );

/**
 * Format a single srcset entry to string
 */
const formatEntry = (entry: SrcsetEntry): string => {
  const initial = A.of(entry.url);
  const withWidth = appendOptional(initial, entry.width, "w");
  const withHeight = appendOptional(withWidth, entry.height, "h");
  const withDensity = appendOptional(withHeight, entry.density, "x");

  return A.join(withDensity, " ");
};

/**
 * Stringify srcset entries back to attribute format.
 *
 * @example
 * ```typescript
 * import { stringifySrcset } from "@beep/utils/sanitize-html/url/srcset-parser"
 *
 * stringifySrcset([
 *   { url: "small.jpg", width: 100 },
 *   { url: "large.jpg", width: 200 }
 * ])
 * // "small.jpg 100w, large.jpg 200w"
 * ```
 *
 * @since 0.1.0
 * @category serialization
 */
export const stringifySrcset = (entries: readonly SrcsetEntry[]): string =>
  F.pipe(entries, A.map(formatEntry), A.join(", "));

/**
 * Filter srcset entries, removing any with dangerous URLs.
 *
 * @example
 * ```typescript
 * import { filterSrcset } from "@beep/utils/sanitize-html/url/srcset-parser"
 *
 * filterSrcset(
 *   "safe.jpg 100w, javascript:alert(1) 200w",
 *   { allowedSchemes: ["http", "https"], allowProtocolRelative: true }
 * )
 * // "safe.jpg 100w"
 * ```
 *
 * @since 0.1.0
 * @category filtering
 */
export const filterSrcset = (srcset: string, options: UrlValidationOptions): string => {
  const entries = parseSrcset(srcset);

  const filtered = A.filter(entries, (entry) => !isNaughtyHref(entry.url, options));

  return stringifySrcset(filtered);
};
