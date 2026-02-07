import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { Citation } from "./AnswerSchemas";
import * as S from "effect/Schema";
import {$KnowledgeServerId} from "@beep/identity/packages";
const $I = $KnowledgeServerId.create("GraphRAG/CitationParser");
const ENTITY_CITATION_REGEX = /\{\{entity:([^}]+)}}/g;

const RELATION_CITATION_REGEX = /\{\{relation:([^}]+)}}/g;

const SENTENCE_BOUNDARY_REGEX = /[.!?]+\s*/;
export class CitationMatch extends S.Class<CitationMatch>($I`CitationMatch`)({
  match: S.String,
  id: S.String,
  index: S.Number
}) {}

export class SentenceCitations extends S.Class<SentenceCitations>($I`SentenceCitations`)({
  sentence: S.String,
  entityIds: S.Array(S.String),
  relationIds: S.Array(S.String)
}) {}


const deduplicateIds = (ids: ReadonlyArray<string>): ReadonlyArray<string> => A.dedupe(ids);

const extractAllMatches = (text: string, regex: RegExp): ReadonlyArray<CitationMatch> => {
  const matches = Str.matchAll(new RegExp(regex.source, regex.flags))(text);
  return F.pipe(
    A.fromIterable(matches),
    A.filterMap((match) => {
      const idx = match.index;

      return P.isNotUndefined(idx)
        ? O.some({
            match: match[0],
            id: match[1] ?? Str.empty,
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
export class Accumulator extends S.Class<Accumulator>($I`Accumulator`)({
  currentPosition: S.Number,
  found: S.Option(S.String)
}) {}
const extractClaimText = (text: string, position: number): string => {
  const sentences = Str.split(text, SENTENCE_BOUNDARY_REGEX);



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
  const withoutEntities = Str.replace(ENTITY_CITATION_REGEX, "")(text);
  const withoutRelations = Str.replace(RELATION_CITATION_REGEX, "")(withoutEntities);
  return Str.trim(Str.replace(/\s+/g, " ")(withoutRelations));
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
      entityIds: type === "entity" ? [match.id] : A.empty<string>(),
      relationIds: type === "relation" ? [match.id] : A.empty<string>(),
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
    return A.empty<SentenceCitations>();
  }

  const afterEntities = A.reduce(entityMatches, R.empty<string, SentenceCitations>(), (acc, match) =>
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

const parseNonEmptyString = (s: string): O.Option<string> => (Str.isEmpty(s) ? O.none() : O.some(s));

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
    return A.empty<Citation>();
  }

  const contextSet = HashSet.fromIterable(contextEntityIds);

  return A.filterMap(sentenceGroups, (group) => sentenceGroupToCitation(group, contextSet));
};

export const stripAllCitations = (text: string): string => stripCitationMarkers(text);

export const countCitations = (text: string): number =>
  A.length(extractAllMatches(text, ENTITY_CITATION_REGEX)) + A.length(extractAllMatches(text, RELATION_CITATION_REGEX));

export const hasCitations = (text: string): boolean => countCitations(text) > 0;
