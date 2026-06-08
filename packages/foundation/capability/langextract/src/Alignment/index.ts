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

const DEFAULT_FUZZY_THRESHOLD = 0.82;

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
    confidence?: number;
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

const findLesser = (sourceText: string, query: string): undefined | readonly [number, string] => {
  const normalizedQuery = lower(query);

  for (let start = 0; start <= sourceText.length - query.length; start += 1) {
    const candidate = sourceText.slice(start, start + query.length);
    if (lower(candidate) === normalizedQuery) {
      return [start, candidate];
    }
  }

  return undefined;
};

const levenshtein = (left: string, right: string): number => {
  const previous = A.makeBy(right.length + 1, (index) => index);

  for (let i = 0; i < left.length; i += 1) {
    const current = [i + 1];
    for (let j = 0; j < right.length; j += 1) {
      current[j + 1] =
        left[i] === right[j]
          ? (previous[j] ?? 0)
          : Math.min(previous[j] ?? 0, current[j] ?? 0, previous[j + 1] ?? 0) + 1;
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length] ?? 0;
};

const similarity = (left: string, right: string): number => {
  const denominator = Math.max(left.length, right.length, 1);
  return 1 - levenshtein(lower(left), lower(right)) / denominator;
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
    return candidates
      .slice(0, options?.maxExtractions ?? candidates.length)
      .map((candidate) => alignCandidate(sourceText, candidate, options));
  }
);
