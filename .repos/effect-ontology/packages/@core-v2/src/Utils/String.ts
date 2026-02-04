/**
 * String Utilities
 *
 * Pure utility functions for string operations:
 * - Similarity calculations (Levenshtein, Jaccard, containment)
 * - Normalization and canonicalization
 * - Token-based operations
 *
 * @since 2.0.0
 * @module Utils/String
 */

/**
 * Normalize a string for comparison
 *
 * Converts to lowercase, trims whitespace, and normalizes internal spacing.
 *
 * @param text - Input string
 * @returns Normalized string
 *
 * @example
 * ```typescript
 * normalizeString("  Hello   World  ")
 * // => "hello world"
 * ```
 */
export const normalizeString = (text: string): string => text.toLowerCase().trim().replace(/\s+/g, " ")

/**
 * Calculate Levenshtein edit distance between two strings
 *
 * Uses dynamic programming for O(mn) time and O(min(m,n)) space.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Number of edits (insertions, deletions, substitutions)
 *
 * @example
 * ```typescript
 * levenshteinDistance("kitten", "sitting")
 * // => 3
 * ```
 */
export const levenshteinDistance = (a: string, b: string): number => {
  // Optimize for common cases
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // Ensure a is the shorter string for space optimization
  if (a.length > b.length) {
    ;[a, b] = [b, a]
  }

  // Use two rows instead of full matrix
  let prevRow = Array.from({ length: a.length + 1 }, (_, i) => i)
  let currRow = new Array<number>(a.length + 1)

  for (let j = 1; j <= b.length; j++) {
    currRow[0] = j
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      currRow[i] = Math.min(
        prevRow[i] + 1, // deletion
        currRow[i - 1] + 1, // insertion
        prevRow[i - 1] + cost // substitution
      )
    }
    ;[prevRow, currRow] = [currRow, prevRow]
  }

  return prevRow[a.length]
}

/**
 * Calculate normalized Levenshtein similarity (0.0 to 1.0)
 *
 * Returns 1.0 for identical strings, 0.0 for completely different strings.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * levenshteinSimilarity("hello", "hallo")
 * // => 0.8 (1 edit out of 5 chars)
 * ```
 */
export const levenshteinSimilarity = (a: string, b: string): number => {
  if (a === b) return 1.0
  if (a.length === 0 || b.length === 0) return 0.0

  const maxLen = Math.max(a.length, b.length)
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  return 1.0 - distance / maxLen
}

/**
 * Check if one string contains another (case-insensitive)
 *
 * @param text - Text to search in
 * @param substring - Substring to search for
 * @returns True if text contains substring
 *
 * @example
 * ```typescript
 * containsIgnoreCase("Eberechi Eze", "Eze")
 * // => true
 * ```
 */
export const containsIgnoreCase = (text: string, substring: string): boolean =>
  text.toLowerCase().includes(substring.toLowerCase())

/**
 * Check bidirectional containment between two strings
 *
 * Returns true if either string contains the other.
 * Useful for matching "Eze" with "Eberechi Eze".
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if either contains the other
 *
 * @example
 * ```typescript
 * hasBidirectionalContainment("Eze", "Eberechi Eze")
 * // => true
 * ```
 */
export const hasBidirectionalContainment = (a: string, b: string): boolean =>
  containsIgnoreCase(a, b) || containsIgnoreCase(b, a)

/**
 * Calculate Jaccard similarity between two token sets
 *
 * Jaccard = |intersection| / |union|
 *
 * @param tokensA - First token set
 * @param tokensB - Second token set
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * jaccardSimilarity(["hello", "world"], ["hello", "there"])
 * // => 0.333 (1 common out of 3 unique)
 * ```
 */
export const jaccardSimilarity = (
  tokensA: ReadonlyArray<string>,
  tokensB: ReadonlyArray<string>
): number => {
  if (tokensA.length === 0 && tokensB.length === 0) return 1.0
  if (tokensA.length === 0 || tokensB.length === 0) return 0.0

  const setA = new Set(tokensA.map((t) => t.toLowerCase()))
  const setB = new Set(tokensB.map((t) => t.toLowerCase()))

  let intersectionSize = 0
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionSize++
    }
  }

  const unionSize = setA.size + setB.size - intersectionSize
  return unionSize > 0 ? intersectionSize / unionSize : 0.0
}

/**
 * Tokenize a string into words (simple whitespace split)
 *
 * Splits on whitespace and filters empty tokens.
 * For more advanced tokenization, use NlpService.
 *
 * @param text - Input text
 * @returns Array of tokens
 *
 * @example
 * ```typescript
 * simpleTokenize("Hello, World!")
 * // => ["Hello,", "World!"]
 * ```
 */
export const simpleTokenize = (text: string): ReadonlyArray<string> => text.split(/\s+/).filter((t) => t.length > 0)

/**
 * Calculate token-based similarity using Jaccard
 *
 * Tokenizes both strings and computes Jaccard similarity.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * tokenSimilarity("Arsenal FC", "Arsenal Football Club")
 * // => 0.333 (1 common token out of 4 unique)
 * ```
 */
export const tokenSimilarity = (a: string, b: string): number => jaccardSimilarity(simpleTokenize(a), simpleTokenize(b))

/**
 * Calculate combined similarity score
 *
 * Combines Levenshtein similarity and containment check
 * for robust entity matching.
 *
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * combinedSimilarity("Eze", "Eberechi Eze")
 * // => 1.0 (containment match)
 *
 * combinedSimilarity("Ronaldo", "Ronald")
 * // => ~0.86 (high Levenshtein similarity)
 * ```
 */
export const combinedSimilarity = (a: string, b: string): number => {
  // Perfect match
  if (a.toLowerCase() === b.toLowerCase()) return 1.0

  // Containment check (one is substring of other)
  if (hasBidirectionalContainment(a, b)) return 1.0

  // Fall back to Levenshtein similarity
  return levenshteinSimilarity(a, b)
}

/**
 * Calculate overlap ratio between two arrays
 *
 * Returns the ratio of shared elements to the smaller array size.
 *
 * @param arrA - First array
 * @param arrB - Second array
 * @returns Overlap ratio between 0.0 and 1.0
 *
 * @example
 * ```typescript
 * overlapRatio(["Player", "Person"], ["Player", "Athlete"])
 * // => 0.5 (1 shared out of min(2, 2))
 * ```
 */
export const overlapRatio = <T>(
  arrA: ReadonlyArray<T>,
  arrB: ReadonlyArray<T>
): number => {
  if (arrA.length === 0 || arrB.length === 0) return 0.0

  const setB = new Set(arrB)
  const intersection = arrA.filter((item) => setB.has(item))

  const smallerSize = Math.min(arrA.length, arrB.length)
  return intersection.length / smallerSize
}

/**
 * Generate snake_case ID from human-readable text
 *
 * Converts text to lowercase snake_case identifier.
 *
 * @param text - Human-readable text
 * @returns snake_case identifier
 *
 * @example
 * ```typescript
 * toSnakeCase("Cristiano Ronaldo")
 * // => "cristiano_ronaldo"
 *
 * toSnakeCase("Arsenal F.C.")
 * // => "arsenal_fc"
 * ```
 */
export const toSnakeCase = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars except dash
    .replace(/\s+/g, "_") // Spaces to underscores
    .replace(/_+/g, "_") // Multiple underscores to single
    .replace(/^_|_$/g, "") // Trim leading/trailing underscores
    .replace(/^[0-9]/, "e$&") // Ensure starts with letter
