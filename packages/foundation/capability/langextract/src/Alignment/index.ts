/**
 * Deterministic source alignment for parsed extraction candidates.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { GroundedExtraction } from "@beep/langextract/Extraction";
import { Contract } from "@beep/nlp/Handoff";
import { NonNegativeInt } from "@beep/schema";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { ExtractionCandidate, LangExtractOptions } from "@beep/langextract/Extraction";
import type { UnitInterval } from "@beep/nlp/Handoff";

const DEFAULT_FUZZY_THRESHOLD = 0.82;

/**
 * Defensive bounds for the fuzzy alignment path. Fuzzy matching slides a
 * query-sized word window across the source and runs an `O(n*m)` Levenshtein
 * comparison per window, so even schema-bounded inputs are kept within a
 * predictable CPU budget. When the source or query exceeds these limits the
 * fuzzy fallback is skipped and the candidate fails closed to `unaligned`
 * rather than blocking the runtime. The default extraction cap prevents an
 * unbounded candidate array from multiplying that per-candidate cost when the
 * caller omits an explicit `maxExtractions`.
 */
const MAX_FUZZY_SOURCE_LENGTH = 100_000;
const MAX_FUZZY_QUERY_LENGTH = 4_096;
const DEFAULT_MAX_EXTRACTIONS = 256;

const lower = Str.toLowerCase;

const makeGrounded = (
  candidate: ExtractionCandidate,
  status: GroundedExtraction["alignmentStatus"],
  span?: Contract.Span,
  matchedText?: string
): GroundedExtraction => {
  const input: {
    alignmentStatus: GroundedExtraction["alignmentStatus"];
    attributes?: Readonly<Record<string, string>>;
    confidence?: UnitInterval;
    label: ExtractionCandidate["label"];
    matchedText?: string;
    span?: Contract.Span;
    text: ExtractionCandidate["text"];
  } = {
    alignmentStatus: status,
    label: candidate.label,
    text: candidate.text,
  };

  if (candidate.attributes !== undefined) {
    input.attributes = candidate.attributes;
  }
  if (candidate.confidence !== undefined) {
    input.confidence = candidate.confidence;
  }
  if (matchedText !== undefined) {
    input.matchedText = matchedText;
  }
  if (span !== undefined) {
    input.span = span;
  }

  return GroundedExtraction.make(input);
};

const spanFromMatch = (start: number, matchedText: string): Contract.Span =>
  Contract.Span.make({
    end: NonNegativeInt.make(start + matchedText.length),
    start: NonNegativeInt.make(start),
  });

const findExact = (sourceText: string, query: string): undefined | readonly [number, string] => {
  const start = sourceText.indexOf(query);
  return start >= 0 ? [start, query] : undefined;
};

const lowerWithSourceOffsets = (
  sourceText: string
): {
  readonly ends: ReadonlyArray<number>;
  readonly starts: ReadonlyArray<number>;
  readonly text: string;
} => {
  const starts: Array<number> = [];
  const ends: Array<number> = [];
  let text = "";
  let sourceStart = 0;

  for (const segment of sourceText) {
    const sourceEnd = sourceStart + segment.length;
    const normalizedSegment = lower(segment);
    for (let index = 0; index < normalizedSegment.length; index += 1) {
      starts.push(sourceStart);
      ends.push(sourceEnd);
    }
    text += normalizedSegment;
    sourceStart = sourceEnd;
  }

  return { ends, starts, text };
};

const findLesser = (sourceText: string, query: string): undefined | readonly [number, string] => {
  const normalizedQuery = lower(query);
  if (normalizedQuery.length === 0) {
    return undefined;
  }

  const normalizedSource = lowerWithSourceOffsets(sourceText);
  const normalizedStart = normalizedSource.text.indexOf(normalizedQuery);
  if (normalizedStart < 0) {
    return undefined;
  }

  const normalizedEnd = normalizedStart + normalizedQuery.length - 1;
  const start = normalizedSource.starts[normalizedStart];
  const end = normalizedSource.ends[normalizedEnd];
  if (start === undefined || end === undefined) {
    return undefined;
  }

  return [start, sourceText.slice(start, end)];
};

const toCodePoints = (value: string): ReadonlyArray<string> => [...value];

const levenshtein = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): number => {
  const previous = A.makeBy(right.length + 1, (index) => index);

  for (let i = 0; i < left.length; i += 1) {
    const current = [i + 1];
    for (let j = 0; j < right.length; j += 1) {
      current[j + 1] =
        left[i] === right[j]
          ? (previous[j] ?? 0)
          : Math.min(previous[j] ?? 0, current[j] ?? 0, previous[j + 1] ?? 0) + 1;
    }
    for (let k = 0; k < current.length; k += 1) {
      previous[k] = current[k] ?? 0;
    }
    previous.length = current.length;
  }

  return previous[right.length] ?? 0;
};

const similarity = (left: string, right: string): number => {
  const leftNormalized = toCodePoints(lower(left));
  const rightNormalized = toCodePoints(lower(right));
  const denominator = Math.max(leftNormalized.length, rightNormalized.length, 1);
  return 1 - levenshtein(leftNormalized, rightNormalized) / denominator;
};

const wordsWithOffsets = (sourceText: string): ReadonlyArray<readonly [number, number]> => {
  const words: Array<readonly [number, number]> = [];
  const pattern = /\S+/gu;
  let match: RegExpExecArray | null = pattern.exec(sourceText);

  while (match !== null) {
    words.push([match.index, match.index + match[0].length]);
    match = pattern.exec(sourceText);
  }

  return words;
};

const findFuzzy = (sourceText: string, query: string, threshold: number): undefined | readonly [number, string] => {
  if (sourceText.length > MAX_FUZZY_SOURCE_LENGTH || query.length > MAX_FUZZY_QUERY_LENGTH) {
    return undefined;
  }

  const queryWordCount = query.trim().split(/\s+/u).filter(Boolean).length;
  if (queryWordCount === 0) {
    return undefined;
  }

  const words = wordsWithOffsets(sourceText);
  if (words.length < queryWordCount) {
    return undefined;
  }

  let best: undefined | readonly [number, string, number];
  for (let index = 0; index <= words.length - queryWordCount; index += 1) {
    const start = words[index]?.[0];
    const end = words[index + queryWordCount - 1]?.[1];
    if (start === undefined || end === undefined) {
      continue;
    }

    const candidate = sourceText.slice(start, end);
    const score = similarity(candidate, query);
    if (score >= threshold && (best === undefined || score > best[2])) {
      best = [start, candidate, score];
    }
  }

  return best === undefined ? undefined : [best[0], best[1]];
};

/**
 * Align one extraction candidate against source text.
 *
 * @example
 * ```ts
 * import { alignCandidate } from "@beep/langextract/Alignment"
 * import { ExtractionCandidate } from "@beep/langextract/Extraction"
 *
 * const candidate = ExtractionCandidate.make({ label: "person", text: "Ada Lovelace" })
 * console.log(alignCandidate("Ada Lovelace wrote notes.", candidate).alignmentStatus)
 * console.log(alignCandidate(candidate)("Ada Lovelace wrote notes.").alignmentStatus)
 * ```
 *
 * @category mapping
 * @since 0.0.0
 */
export const alignCandidate: {
  (sourceText: string, candidate: ExtractionCandidate, options?: LangExtractOptions): GroundedExtraction;
  (candidate: ExtractionCandidate, options?: LangExtractOptions): (sourceText: string) => GroundedExtraction;
} = dual(
  (args) => P.isString(args[0]),
  function alignCandidateImpl(
    sourceText: string,
    candidate: ExtractionCandidate,
    options?: LangExtractOptions
  ): GroundedExtraction {
    const exact = findExact(sourceText, candidate.text);
    if (exact !== undefined) {
      return makeGrounded(candidate, "match_exact", spanFromMatch(exact[0], exact[1]), exact[1]);
    }

    const lesser = findLesser(sourceText, candidate.text);
    if (lesser !== undefined) {
      return makeGrounded(candidate, "match_lesser", spanFromMatch(lesser[0], lesser[1]), lesser[1]);
    }

    const fuzzy = findFuzzy(sourceText, candidate.text, options?.fuzzyThreshold ?? DEFAULT_FUZZY_THRESHOLD);
    if (fuzzy !== undefined) {
      return makeGrounded(candidate, "match_fuzzy", spanFromMatch(fuzzy[0], fuzzy[1]), fuzzy[1]);
    }

    return makeGrounded(candidate, "unaligned");
  }
);

/**
 * Align candidates and honor the optional maximum extraction count.
 *
 * @example
 * ```ts
 * import { alignCandidates } from "@beep/langextract/Alignment"
 * import { ExtractionCandidate } from "@beep/langextract/Extraction"
 *
 * const candidates = [ExtractionCandidate.make({ label: "person", text: "Ada Lovelace" })]
 * console.log(alignCandidates("Ada Lovelace wrote notes.", candidates).length)
 * console.log(alignCandidates(candidates)("Ada Lovelace wrote notes.").length)
 * ```
 *
 * @category mapping
 * @since 0.0.0
 */
export const alignCandidates: {
  (
    sourceText: string,
    candidates: ReadonlyArray<ExtractionCandidate>,
    options?: LangExtractOptions
  ): ReadonlyArray<GroundedExtraction>;
  (
    candidates: ReadonlyArray<ExtractionCandidate>,
    options?: LangExtractOptions
  ): (sourceText: string) => ReadonlyArray<GroundedExtraction>;
} = dual(
  (args) => P.isString(args[0]),
  function alignCandidatesImpl(
    sourceText: string,
    candidates: ReadonlyArray<ExtractionCandidate>,
    options?: LangExtractOptions
  ): ReadonlyArray<GroundedExtraction> {
    const limit = options?.maxExtractions ?? Math.min(candidates.length, DEFAULT_MAX_EXTRACTIONS);
    return A.map(A.take(candidates, limit), (candidate) => alignCandidate(sourceText, candidate, options));
  }
);
