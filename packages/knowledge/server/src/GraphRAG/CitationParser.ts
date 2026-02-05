import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import type * as S from "effect/Schema";
import * as Str from "effect/String";
import { Citation } from "./AnswerSchemas";

type NonEmptyString = S.Schema.Type<typeof S.NonEmptyString>;

const ENTITY_CITATION_REGEX = /\{\{entity:([^}]+)}}/g;

const RELATION_CITATION_REGEX = /\{\{relation:([^}]+)}}/g;

const SENTENCE_BOUNDARY_REGEX = /[.!?]+\s*/;

interface CitationMatch {
  readonly match: string;
  readonly id: string;
  readonly index: number;
}

interface SentenceCitations {
  readonly sentence: string;
  readonly entityIds: ReadonlyArray<string>;
  readonly relationIds: ReadonlyArray<string>;
}

const deduplicateIds = (ids: ReadonlyArray<string>): ReadonlyArray<string> => A.dedupe(ids);

const extractAllMatches = (text: string, regex: RegExp): ReadonlyArray<CitationMatch> => {
  const matches = text.matchAll(new RegExp(regex.source, regex.flags));
  return F.pipe(
    A.fromIterable(matches),
    A.filterMap((match) => {
      const idx = match.index;
      return P.isNotUndefined(idx)
        ? O.some({
            match: match[0],
            id: match[1] ?? "",
            index: idx,
          })
        : O.none();
    })
  );
};

export const extractEntityIds = (text: string): ReadonlyArray<string> =>
  F.pipe(
    extractAllMatches(text, ENTITY_CITATION_REGEX),
    A.map((m) => m.id),
    deduplicateIds
  );

export const extractRelationIds = (text: string): ReadonlyArray<string> =>
  F.pipe(
    extractAllMatches(text, RELATION_CITATION_REGEX),
    A.map((m) => m.id),
    deduplicateIds
  );

const extractClaimText = (text: string, position: number): string => {
  const sentences = Str.split(text, SENTENCE_BOUNDARY_REGEX);

  interface Accumulator {
    readonly currentPosition: number;
    readonly found: O.Option<string>;
  }

  const result = A.reduce(sentences, { currentPosition: 0, found: O.none() } as Accumulator, (acc, sentence) => {
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
  });

  return O.getOrElse(result.found, () => {
    const fallback = Str.trim(text);
    return Str.isEmpty(fallback) ? "Unknown claim" : fallback;
  });
};

const stripCitationMarkers = (text: string): string => {
  const withoutEntities = text.replace(ENTITY_CITATION_REGEX, "");
  const withoutRelations = withoutEntities.replace(RELATION_CITATION_REGEX, "");
  return Str.trim(withoutRelations.replace(/\s+/g, " "));
};

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
      entityIds: type === "entity" ? A.append(prev.entityIds, match.id) : prev.entityIds,
      relationIds: type === "relation" ? A.append(prev.relationIds, match.id) : prev.relationIds,
    }),
  });

  return R.set(record, cleanSentence, updated);
};

const groupCitationsBySentence = (text: string): ReadonlyArray<SentenceCitations> => {
  const entityMatches = extractAllMatches(text, ENTITY_CITATION_REGEX);
  const relationMatches = extractAllMatches(text, RELATION_CITATION_REGEX);

  if (A.isEmptyReadonlyArray(entityMatches) && A.isEmptyReadonlyArray(relationMatches)) {
    return [];
  }

  const afterEntities = A.reduce(entityMatches, {} as Record<string, SentenceCitations>, (acc, match) =>
    mergeMatchIntoRecord(acc, text, match, "entity")
  );

  const afterRelations = A.reduce(relationMatches, afterEntities, (acc, match) =>
    mergeMatchIntoRecord(acc, text, match, "relation")
  );

  return R.values(afterRelations);
};

const isValidEntityId = (id: string): id is KnowledgeEntityIds.KnowledgeEntityId.Type =>
  KnowledgeEntityIds.KnowledgeEntityId.is(id);

const isValidRelationId = (id: string): id is KnowledgeEntityIds.RelationId.Type =>
  KnowledgeEntityIds.RelationId.is(id);

const parseNonEmptyString = (s: string): O.Option<NonEmptyString> =>
  Str.isEmpty(s) ? O.none() : O.some(s as NonEmptyString);

const sentenceGroupToCitation = (group: SentenceCitations, contextSet: HashSet.HashSet<string>): O.Option<Citation> => {
  const validEntityIds = F.pipe(
    deduplicateIds(group.entityIds),
    A.filter((id) => isValidEntityId(id) && HashSet.has(contextSet, id))
  );

  if (A.isEmptyReadonlyArray(validEntityIds)) {
    return O.none();
  }

  const typedEntityIds = A.filterMap(validEntityIds, (id) => (isValidEntityId(id) ? O.some(id) : O.none()));

  const typedRelationId = F.pipe(
    deduplicateIds(group.relationIds),
    A.filterMap((id) => (isValidRelationId(id) ? O.some(id) : O.none())),
    A.head
  );

  return O.map(
    parseNonEmptyString(group.sentence),
    (claimText) =>
      new Citation({
        claimText,
        entityIds: typedEntityIds,
        relationId: O.getOrUndefined(typedRelationId),
        confidence: 1.0,
      })
  );
};

export const parseCitations = (text: string, contextEntityIds: ReadonlyArray<string>): ReadonlyArray<Citation> => {
  const sentenceGroups = groupCitationsBySentence(text);

  if (A.isEmptyReadonlyArray(sentenceGroups)) {
    return [];
  }

  const contextSet = HashSet.fromIterable(contextEntityIds);

  return A.filterMap(sentenceGroups, (group) => sentenceGroupToCitation(group, contextSet));
};

export const stripAllCitations = (text: string): string => stripCitationMarkers(text);

export const countCitations = (text: string): number =>
  A.length(extractAllMatches(text, ENTITY_CITATION_REGEX)) + A.length(extractAllMatches(text, RELATION_CITATION_REGEX));

export const hasCitations = (text: string): boolean => countCitations(text) > 0;
