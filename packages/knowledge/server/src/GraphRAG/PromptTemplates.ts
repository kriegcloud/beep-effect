import { thunkEmptyStr } from "@beep/utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { extractLocalName } from "../Ontology/constants";

export interface GraphContextEntity {
  readonly id: string;
  readonly mention: string;
  readonly types: ReadonlyArray<string>;
  readonly attributes?: undefined | Readonly<Record<string, string>>;
}

export interface GraphContextRelation {
  readonly id: string;
  readonly subjectId: string;
  readonly predicate: string;
  readonly objectId: string;
}

export interface GraphContext {
  readonly entities: ReadonlyArray<GraphContextEntity>;
  readonly relations: ReadonlyArray<GraphContextRelation>;
}

export interface PromptParts {
  readonly system: string;
  readonly user: string;
}

export const GROUNDED_ANSWER_SYSTEM_PROMPT =
  `You are a knowledge assistant that answers questions using ONLY the provided context.

CITATION FORMAT (REQUIRED):
- When mentioning an entity, cite it: {{entity:entity_id}}
- When describing a relationship, cite it: {{relation:relation_id}}
- Every factual claim MUST have a citation

If the context does not contain enough information, say "I don't have enough information to answer this question" and explain what information is missing.

RULES:
1. Only use information from the provided context
2. Cite every entity and relation you reference
3. If you cannot answer, say so explicitly
4. Do not make up or infer information not present in the context
5. Use the exact entity IDs and relation IDs provided for citations` as const;

export const formatEntityForPrompt = (entity: GraphContextEntity): string => {
  const localTypes = A.map(entity.types, extractLocalName);
  const typeStr = A.isNonEmptyReadonlyArray(localTypes) ? A.join(localTypes, ", ") : "Unknown";

  const attrPart = F.pipe(
    O.fromNullable(entity.attributes),
    O.flatMap((attrs) => {
      const entries = R.toEntries(attrs);
      return A.isNonEmptyReadonlyArray(entries)
        ? O.some(
            F.pipe(
              entries,
              A.map(([k, v]) => `${extractLocalName(k)}: ${v}`),
              A.join(", ")
            )
          )
        : O.none();
    }),
    O.map((str) => ` - ${str}`),
    O.getOrElse(thunkEmptyStr)
  );

  return `- [id: ${entity.id}] ${entity.mention} (${typeStr})${attrPart}`;
};

export const formatRelationForPrompt = (
  relation: GraphContextRelation,
  entityLookup: HashMap.HashMap<string, GraphContextEntity>
): string => {
  const subjectName = F.pipe(
    HashMap.get(entityLookup, relation.subjectId),
    O.map((e) => e.mention),
    O.getOrElse(() => relation.subjectId)
  );

  const objectName = F.pipe(
    HashMap.get(entityLookup, relation.objectId),
    O.map((e) => e.mention),
    O.getOrElse(() => relation.objectId)
  );

  const predicate = extractLocalName(relation.predicate);

  return `- [id: ${relation.id}] ${subjectName} --[${predicate}]--> ${objectName}`;
};

const buildEntityLookup = (entities: ReadonlyArray<GraphContextEntity>): HashMap.HashMap<string, GraphContextEntity> =>
  F.pipe(
    entities,
    A.map((e) => [e.id, e] as const),
    HashMap.fromIterable
  );

const buildUserPrompt = (context: GraphContext, question: string): string => {
  const entityLookup = buildEntityLookup(context.entities);

  const entitiesSection = A.isNonEmptyReadonlyArray(context.entities)
    ? F.pipe(context.entities, A.map(formatEntityForPrompt), A.join("\n"), (lines) => `### Entities\n${lines}`)
    : "### Entities\nNo entities available in context.";

  const relationsSection = A.isNonEmptyReadonlyArray(context.relations)
    ? F.pipe(
        context.relations,
        A.map((r) => formatRelationForPrompt(r, entityLookup)),
        A.join("\n"),
        (lines) => `### Relations\n${lines}`
      )
    : "### Relations\nNo relations available in context.";

  const trimmedQuestion = Str.trim(question);

  const sections: ReadonlyArray<string> = [
    "## Context",
    entitiesSection,
    relationsSection,
    `## Question\n${trimmedQuestion}`,
    "## Answer (with citations)",
  ];

  return A.join(sections, "\n\n");
};

export const buildGroundedAnswerPrompt = (context: GraphContext, question: string): PromptParts => ({
  system: GROUNDED_ANSWER_SYSTEM_PROMPT,
  user: buildUserPrompt(context, question),
});

export const ENTITY_CITATION_REGEX = /\{\{entity:([^}]+)}}/g;

export const RELATION_CITATION_REGEX = /\{\{relation:([^}]+)}}/g;

export interface ParsedCitation {
  readonly type: "entity" | "relation";
  readonly id: string;
  readonly matchStart: number;
  readonly matchEnd: number;
}

const collectRegexMatches = (
  text: string,
  regex: RegExp,
  type: "entity" | "relation"
): ReadonlyArray<ParsedCitation> => {
  const matches = Str.matchAll(regex)(text);
  const results = A.empty<ParsedCitation>();
  for (const match of matches) {
    if (P.isNotUndefined(match.index) && P.isNotUndefined(match[1])) {
      results.push({
        type,
        id: Str.trim(match[1]),
        matchStart: match.index,
        matchEnd: match.index + Str.length(match[0]),
      });
    }
  }
  return results;
};

export const extractCitations = (text: string): ReadonlyArray<ParsedCitation> => {
  const entityCitations = collectRegexMatches(text, ENTITY_CITATION_REGEX, "entity");
  const relationCitations = collectRegexMatches(text, RELATION_CITATION_REGEX, "relation");

  return A.sort(
    A.appendAll(entityCitations, relationCitations),
    Order.mapInput(Order.number, (c: ParsedCitation) => c.matchStart)
  );
};

export const stripCitationMarkers = (text: string): string =>
  F.pipe(
    text,
    Str.replace(ENTITY_CITATION_REGEX, ""),
    Str.replace(RELATION_CITATION_REGEX, ""),
    Str.replace(/\s{2,}/g, " "),
    Str.trim
  );
