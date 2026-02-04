/**
 * Citation Parser for GraphRAG Grounded Answers
 *
 * Extracts and parses citation markers from LLM responses to build
 * structured Citation objects linking claims to knowledge graph entities.
 *
 * @module knowledge-server/GraphRAG/CitationParser
 * @since 0.1.0
 */
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import type * as S from "effect/Schema";
import * as Str from "effect/String";
import { Citation } from "./AnswerSchemas";

/**
 * NonEmptyString branded type from Effect Schema.
 *
 * @since 0.1.0
 * @category types
 */
type NonEmptyString = S.Schema.Type<typeof S.NonEmptyString>;

/**
 * Regex pattern for entity citation markers.
 *
 * Matches `{{entity:knowledge_entity__uuid}}` format.
 *
 * @since 0.1.0
 * @category constants
 */
const ENTITY_CITATION_REGEX = /\{\{entity:([^}]+)}}/g;

/**
 * Regex pattern for relation citation markers.
 *
 * Matches `{{relation:knowledge_relation__uuid}}` format.
 *
 * @since 0.1.0
 * @category constants
 */
const RELATION_CITATION_REGEX = /\{\{relation:([^}]+)}}/g;

/**
 * Sentence boundary pattern for claim extraction.
 *
 * Matches common sentence terminators.
 *
 * @since 0.1.0
 * @category constants
 */
const SENTENCE_BOUNDARY_REGEX = /[.!?]+\s*/;

/**
 * Match result with position information.
 *
 * @since 0.1.0
 * @category types
 */
interface CitationMatch {
  readonly match: string;
  readonly id: string;
  readonly index: number;
}

/**
 * Group citation information by sentence.
 *
 * @since 0.1.0
 * @category types
 */
interface SentenceCitations {
  readonly sentence: string;
  readonly entityIds: ReadonlyArray<string>;
  readonly relationIds: ReadonlyArray<string>;
}

/**
 * Remove duplicate strings while preserving order.
 *
 * @since 0.1.0
 * @category helpers
 */
const deduplicateIds = (ids: ReadonlyArray<string>): ReadonlyArray<string> =>
  A.dedupe(ids);

/**
 * Extract all matches from a regex applied to text.
 *
 * Uses String.matchAll for functional iteration over regex matches.
 *
 * @since 0.1.0
 * @category helpers
 */
const extractAllMatches = (
  text: string,
  regex: RegExp
): ReadonlyArray<CitationMatch> => {
  const matches = text.matchAll(new RegExp(regex.source, regex.flags));
  return pipe(
    A.fromIterable(matches),
    A.filterMap((match) =>
      O.fromNullable(
        match.index !== undefined
          ? {
              match: match[0],
              id: match[1] ?? "",
              index: match.index,
            }
          : null
      )
    )
  );
};

/**
 * Extract all entity IDs from citation markers in text.
 *
 * Parses `{{entity:id}}` markers and returns deduplicated entity ID strings.
 *
 * @param text - LLM response text containing `{{entity:id}}` markers
 * @returns Array of extracted entity ID strings (deduplicated)
 *
 * @since 0.1.0
 * @category parsers
 */
export const extractEntityIds = (text: string): ReadonlyArray<string> =>
  pipe(
    extractAllMatches(text, ENTITY_CITATION_REGEX),
    A.map((m) => m.id),
    deduplicateIds
  );

/**
 * Extract all relation IDs from citation markers in text.
 *
 * Parses `{{relation:id}}` markers and returns deduplicated relation ID strings.
 *
 * @param text - LLM response text containing `{{relation:id}}` markers
 * @returns Array of extracted relation ID strings (deduplicated)
 *
 * @since 0.1.0
 * @category parsers
 */
export const extractRelationIds = (text: string): ReadonlyArray<string> =>
  pipe(
    extractAllMatches(text, RELATION_CITATION_REGEX),
    A.map((m) => m.id),
    deduplicateIds
  );

/**
 * Find the sentence containing a given position in the text.
 *
 * Uses functional reduction to find the sentence boundary.
 *
 * @param text - Full text
 * @param position - Character position within the text
 * @returns The sentence containing the position
 *
 * @since 0.1.0
 * @category helpers
 */
const extractClaimText = (text: string, position: number): string => {
  const sentences = Str.split(text, SENTENCE_BOUNDARY_REGEX);

  interface Accumulator {
    readonly currentPosition: number;
    readonly found: O.Option<string>;
  }

  const result = A.reduce(
    sentences,
    { currentPosition: 0, found: O.none() } as Accumulator,
    (acc, sentence) => {
      if (O.isSome(acc.found)) {
        return acc;
      }

      const sentenceEnd = acc.currentPosition + Str.length(sentence);

      if (position >= acc.currentPosition && position < sentenceEnd) {
        const trimmed = Str.trim(sentence);
        return {
          currentPosition: sentenceEnd + 1,
          found: O.some(Str.isEmpty(trimmed) ? "Unknown claim" : trimmed),
        };
      }

      return {
        currentPosition: sentenceEnd + 1,
        found: O.none(),
      };
    }
  );

  return O.getOrElse(result.found, () => {
    const fallback = Str.trim(text);
    return Str.isEmpty(fallback) ? "Unknown claim" : fallback;
  });
};

/**
 * Remove citation markers from text to get clean claim text.
 *
 * @since 0.1.0
 * @category helpers
 */
const stripCitationMarkers = (text: string): string => {
  const withoutEntities = text.replace(ENTITY_CITATION_REGEX, "");
  const withoutRelations = withoutEntities.replace(RELATION_CITATION_REGEX, "");
  return Str.trim(withoutRelations.replace(/\s+/g, " "));
};

/**
 * Merge a match into the sentence citations record.
 *
 * @since 0.1.0
 * @category helpers
 */
const mergeMatchIntoRecord = (
  record: Record<string, SentenceCitations>,
  text: string,
  match: CitationMatch,
  type: "entity" | "relation"
): Record<string, SentenceCitations> => {
  const rawSentence = extractClaimText(text, match.index);
  const cleanSentence = stripCitationMarkers(rawSentence);

  const existing = R.get(record, cleanSentence);

  const updated: SentenceCitations = O.match(existing, {
    onNone: () => ({
      sentence: cleanSentence,
      entityIds: type === "entity" ? [match.id] : [],
      relationIds: type === "relation" ? [match.id] : [],
    }),
    onSome: (prev) => ({
      ...prev,
      entityIds:
        type === "entity" ? A.append(prev.entityIds, match.id) : prev.entityIds,
      relationIds:
        type === "relation"
          ? A.append(prev.relationIds, match.id)
          : prev.relationIds,
    }),
  });

  return R.set(record, cleanSentence, updated);
};

/**
 * Parse text into sentences with their associated citation IDs.
 *
 * Uses functional reduction to group citations by sentence.
 *
 * @since 0.1.0
 * @category helpers
 */
const groupCitationsBySentence = (
  text: string
): ReadonlyArray<SentenceCitations> => {
  const entityMatches = extractAllMatches(text, ENTITY_CITATION_REGEX);
  const relationMatches = extractAllMatches(text, RELATION_CITATION_REGEX);

  if (
    A.isEmptyReadonlyArray(entityMatches) &&
    A.isEmptyReadonlyArray(relationMatches)
  ) {
    return [];
  }

  const afterEntities = A.reduce(
    entityMatches,
    {} as Record<string, SentenceCitations>,
    (acc, match) => mergeMatchIntoRecord(acc, text, match, "entity")
  );

  const afterRelations = A.reduce(
    relationMatches,
    afterEntities,
    (acc, match) => mergeMatchIntoRecord(acc, text, match, "relation")
  );

  return R.values(afterRelations);
};

/**
 * Validate that an entity ID string matches the expected format.
 *
 * @since 0.1.0
 * @category helpers
 */
const isValidEntityId = (id: string): id is KnowledgeEntityIds.KnowledgeEntityId.Type =>
  KnowledgeEntityIds.KnowledgeEntityId.is(id);

/**
 * Validate that a relation ID string matches the expected format.
 *
 * @since 0.1.0
 * @category helpers
 */
const isValidRelationId = (id: string): id is KnowledgeEntityIds.RelationId.Type =>
  KnowledgeEntityIds.RelationId.is(id);

/**
 * Safely parse a string as NonEmptyString, returning Option.
 *
 * @since 0.1.0
 * @category helpers
 */
const parseNonEmptyString = (s: string): O.Option<NonEmptyString> =>
  Str.isEmpty(s) ? O.none() : O.some(s as NonEmptyString);

/**
 * Convert a sentence group to a Citation, returning None if invalid.
 *
 * @since 0.1.0
 * @category helpers
 */
const sentenceGroupToCitation = (
  group: SentenceCitations,
  contextSet: HashSet.HashSet<string>
): O.Option<Citation> => {
  const validEntityIds = pipe(
    deduplicateIds(group.entityIds),
    A.filter((id) => isValidEntityId(id) && HashSet.has(contextSet, id))
  );

  if (A.isEmptyReadonlyArray(validEntityIds)) {
    return O.none();
  }

  const typedEntityIds = A.filterMap(validEntityIds, (id) =>
    isValidEntityId(id) ? O.some(id) : O.none()
  );

  const typedRelationId = pipe(
    deduplicateIds(group.relationIds),
    A.filterMap((id) => (isValidRelationId(id) ? O.some(id) : O.none())),
    A.head
  );

  return O.map(parseNonEmptyString(group.sentence), (claimText) =>
    new Citation({
      claimText,
      entityIds: typedEntityIds,
      relationId: O.getOrUndefined(typedRelationId),
      confidence: 1.0,
    })
  );
};

/**
 * Parse citation markers from LLM response and build Citation objects.
 *
 * Groups entity IDs by the surrounding text context to form citations.
 * For Phase 2, all citations get confidence 1.0 (validation in Phase 3).
 *
 * @param text - LLM response text
 * @param contextEntityIds - All entity IDs available in the context (used for validation)
 * @returns Array of Citation objects
 *
 * @since 0.1.0
 * @category parsers
 */
export const parseCitations = (
  text: string,
  contextEntityIds: ReadonlyArray<string>
): ReadonlyArray<Citation> => {
  const sentenceGroups = groupCitationsBySentence(text);

  if (A.isEmptyReadonlyArray(sentenceGroups)) {
    return [];
  }

  const contextSet = HashSet.fromIterable(contextEntityIds);

  return A.filterMap(sentenceGroups, (group) =>
    sentenceGroupToCitation(group, contextSet)
  );
};

/**
 * Strip all citation markers from text to produce clean prose.
 *
 * Useful for presenting the final answer to users without
 * the internal citation markup.
 *
 * @param text - Text with citation markers
 * @returns Clean text without citation markers
 *
 * @since 0.1.0
 * @category utilities
 */
export const stripAllCitations = (text: string): string =>
  stripCitationMarkers(text);

/**
 * Count the total number of citations in text.
 *
 * @param text - Text with citation markers
 * @returns Total count of entity and relation citations
 *
 * @since 0.1.0
 * @category utilities
 */
export const countCitations = (text: string): number =>
  A.length(extractAllMatches(text, ENTITY_CITATION_REGEX)) +
  A.length(extractAllMatches(text, RELATION_CITATION_REGEX));

/**
 * Check if text contains any citation markers.
 *
 * @param text - Text to check
 * @returns True if text contains at least one citation
 *
 * @since 0.1.0
 * @category utilities
 */
export const hasCitations = (text: string): boolean => countCitations(text) > 0;
