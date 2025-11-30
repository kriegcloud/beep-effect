import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import * as RemoveAccents from "../remove-accents/remove-accents";
import type { MatchOptions, MatchRange } from "./types";

/**
 * Order for comparing match ranges by start index
 */
const matchRangeOrder: Order.Order<MatchRange> = Order.mapInput(Num.Order, A.headNonEmpty);

/**
 * Regex for matching special characters that need escaping in RegExp
 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
 */
const specialCharsRegex = /[.*+?^${}()|[\]\\]/g;

/**
 * Word character regex for word boundary detection
 * @see http://www.ecma-international.org/ecma-262/5.1/#sec-15.10.2.6
 */
const wordCharacterRegex = /[a-z0-9_]/i;

/**
 * Whitespace regex for splitting query into words
 */
const whitespacesRegex = /\s+/;

/**
 * Escapes special regex characters in a string
 */
const escapeRegexCharacters = (str: string): string => pipe(str, Str.replace(specialCharsRegex, "\\$&"));

/**
 * Internal options type with guaranteed boolean values
 */
interface ResolvedOptions {
  readonly insideWords: boolean;
  readonly findAllOccurrences: boolean;
  readonly requireMatchAll: boolean;
}

/**
 * Creates the default options merged with provided options
 */
const resolveOptions = (options?: MatchOptions): ResolvedOptions => ({
  insideWords: options?.insideWords ?? false,
  findAllOccurrences: options?.findAllOccurrences ?? false,
  requireMatchAll: options?.requireMatchAll ?? false,
});

/**
 * Converts text to an array of cleaned (diacritics removed) characters
 */
const toCleanedCharArray = (text: string): readonly string[] =>
  pipe(
    Str.split(text, Str.empty),
    A.map((char) => RemoveAccents.remove(char))
  );

/**
 * Splits a query into non-empty words
 */
const splitQueryIntoWords = (query: string): readonly string[] =>
  pipe(
    Str.split(Str.trim(query), whitespacesRegex),
    A.filter((word) => Str.length(word) > 0)
  );

/**
 * Creates the word boundary prefix for regex matching
 */
const createWordBoundaryPrefix = (word: string, insideWords: boolean): string => {
  const firstCharOption = pipe(word, Str.at(0));
  if (insideWords || O.isNone(firstCharOption)) {
    return Str.empty;
  }
  return wordCharacterRegex.test(firstCharOption.value) ? "\\b" : Str.empty;
};

/**
 * Creates a regex for matching a word
 */
const createWordRegex = (word: string, insideWords: boolean): RegExp => {
  const prefix = createWordBoundaryPrefix(word, insideWords);
  return new RegExp(prefix + escapeRegexCharacters(word), "i");
};

/**
 * Calculates the index adjustment for diacritics that expand to multiple characters
 */
const calculateDiacriticOffset = (
  cleanedTextArray: readonly string[],
  index: number,
  wordLen: number
): { readonly cleanedLength: number; readonly offset: number } => {
  const slicedChars = pipe(cleanedTextArray, A.drop(index), A.take(wordLen));
  const cleanedLength = Str.length(A.join(slicedChars, Str.empty));
  return {
    cleanedLength,
    offset: wordLen - cleanedLength,
  };
};

/**
 * Calculates the initial offset for characters before the match index
 */
const calculateInitialOffset = (cleanedTextArray: readonly string[], index: number): number => {
  const prefixChars = A.take(cleanedTextArray, index);
  return index - Str.length(A.join(prefixChars, Str.empty));
};

/**
 * State for tracking matches during reduction
 */
interface MatchState {
  readonly cleanedText: string;
  readonly matches: readonly MatchRange[];
  readonly failed: boolean;
}

/**
 * Replaces matched portion with spaces to prevent re-matching
 */
const replaceWithSpaces = (text: string, index: number, length: number): string => {
  const before = pipe(text, Str.slice(0, index));
  const spaces = pipe(" ", Str.repeat(length));
  const after = pipe(text, Str.slice(index + length));
  return before + spaces + after;
};

/**
 * Finds all occurrences of a word in the cleaned text
 */
const findWordOccurrences = (
  word: string,
  cleanedTextArray: readonly string[],
  initialCleanedText: string,
  options: ResolvedOptions
): { readonly matches: readonly MatchRange[]; readonly cleanedText: string } => {
  const wordLen = Str.length(word);
  const regex = createWordRegex(word, options.insideWords);
  const matches: MatchRange[] = A.empty();
  let cleanedText = initialCleanedText;

  let occurrence = regex.exec(cleanedText);

  // If requireMatchAll is set and no match found, return empty
  if (options.requireMatchAll && occurrence === null) {
    return { matches: A.empty(), cleanedText: Str.empty };
  }

  while (occurrence !== null) {
    const index = occurrence.index;

    const { offset } = calculateDiacriticOffset(cleanedTextArray, index, wordLen);
    const initialOffset = calculateInitialOffset(cleanedTextArray, index);

    const startIndex = index + initialOffset;
    const endIndex = index + wordLen + initialOffset + offset;

    if (startIndex !== endIndex) {
      matches.push([startIndex, endIndex] as const);
    }

    // Replace matched portion with spaces
    cleanedText = replaceWithSpaces(cleanedText, index, wordLen);

    if (!options.findAllOccurrences) {
      break;
    }

    occurrence = regex.exec(cleanedText);
  }

  return { matches, cleanedText };
};

/**
 * Process a single word and update match state
 */
const processWord = (
  state: MatchState,
  word: string,
  cleanedTextArray: readonly string[],
  options: ResolvedOptions
): MatchState => {
  if (state.failed) {
    return state;
  }

  const result = findWordOccurrences(word, cleanedTextArray, state.cleanedText, options);

  // If requireMatchAll and no matches found for this word
  if (options.requireMatchAll && result.matches.length === 0) {
    return {
      cleanedText: Str.empty,
      matches: A.empty(),
      failed: true,
    };
  }

  return {
    cleanedText: result.cleanedText,
    matches: [...state.matches, ...result.matches],
    failed: false,
  };
};

/**
 * Sorts match ranges by start index
 */
const sortMatches = (matches: readonly MatchRange[]): readonly MatchRange[] => A.sort(matches, matchRangeOrder);

/**
 * Finds matching ranges in text based on a query string.
 *
 * @param text - The text to search in
 * @param query - The query string to match against
 * @param options - Optional matching configuration
 * @returns An array of [startIndex, endIndex] tuples representing match ranges
 *
 * @example
 * ```ts
 * import { match } from "@beep/utils/autosuggest-highlight";
 *
 * // Basic usage
 * match("some text", "te"); // [[5, 7]]
 *
 * // With options
 * match("some text", "e", { insideWords: true }); // [[3, 4]]
 * match("some sweet text", "s", { findAllOccurrences: true }); // [[0, 1], [5, 6]]
 * ```
 */
export const match = (text: string, query: string, options?: undefined | MatchOptions): readonly MatchRange[] => {
  const resolvedOptions = resolveOptions(options);

  const cleanedTextArray = toCleanedCharArray(text);
  const cleanedText = A.join(cleanedTextArray, Str.empty);
  const cleanedQuery = RemoveAccents.remove(query);

  const words = splitQueryIntoWords(cleanedQuery);

  if (A.isEmptyReadonlyArray(words)) {
    return A.empty();
  }

  const initialState: MatchState = {
    cleanedText,
    matches: A.empty(),
    failed: false,
  };

  const finalState = pipe(
    words,
    A.reduce(initialState, (state, word) => processWord(state, word, cleanedTextArray, resolvedOptions))
  );

  if (finalState.failed) {
    return A.empty();
  }

  return sortMatches(finalState.matches);
};
