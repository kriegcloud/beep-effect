/**
 * Options for the match function
 */
export interface MatchOptions {
  /**
   * Searches inside words.
   * @default false
   */
  readonly insideWords?: undefined | boolean;
  /**
   * Finds all occurrences of each match.
   * @default false
   */
  readonly findAllOccurrences?: undefined | boolean;
  /**
   * Requires each word of query to be found in text or else returns an empty set.
   * @default false
   */
  readonly requireMatchAll?: undefined | boolean;
}

/**
 * A match range represented as [startIndex, endIndex]
 */
export type MatchRange = readonly [number, number];

/**
 * A parsed text segment with highlight information
 */
export interface ParsedSegment {
  readonly text: string;
  readonly highlight: boolean;
}
