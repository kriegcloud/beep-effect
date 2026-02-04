/**
 * Prompt Templates for Grounded Answer Generation
 *
 * Provides structured prompts for LLM-based answer generation with citations
 * linked to knowledge graph entities and relations.
 *
 * @module knowledge-server/GraphRAG/PromptTemplates
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { extractLocalName } from "../Ontology/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Entity representation for prompt context
 *
 * Simplified entity shape for building LLM prompts with citation references.
 *
 * @since 0.1.0
 * @category types
 */
export interface GraphContextEntity {
  readonly id: string;
  readonly mention: string;
  readonly types: ReadonlyArray<string>;
  readonly attributes?: undefined | Readonly<Record<string, string>>;
}

/**
 * Relation representation for prompt context
 *
 * Simplified relation shape for building LLM prompts with citation references.
 *
 * @since 0.1.0
 * @category types
 */
export interface GraphContextRelation {
  readonly id: string;
  readonly subjectId: string;
  readonly predicate: string;
  readonly objectId: string;
}

/**
 * Graph context containing entities and relations for prompt building
 *
 * This structure provides the knowledge graph subgraph that will be formatted
 * into the LLM prompt for grounded answer generation.
 *
 * @since 0.1.0
 * @category types
 */
export interface GraphContext {
  readonly entities: ReadonlyArray<GraphContextEntity>;
  readonly relations: ReadonlyArray<GraphContextRelation>;
}

/**
 * Structured prompt output for LLM API calls
 *
 * @since 0.1.0
 * @category types
 */
export interface PromptParts {
  readonly system: string;
  readonly user: string;
}

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

/**
 * System prompt for grounded answer generation
 *
 * Instructs the LLM to:
 * - Use ONLY provided context
 * - Cite entities and relations using specific format
 * - Handle insufficient context gracefully
 *
 * @since 0.1.0
 * @category prompts
 */
export const GROUNDED_ANSWER_SYSTEM_PROMPT = `You are a knowledge assistant that answers questions using ONLY the provided context.

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

// ---------------------------------------------------------------------------
// Formatting Helpers
// ---------------------------------------------------------------------------

/**
 * Format a single entity for the prompt with visible ID for citation
 *
 * Output format: `- [id: entity_id] Mention (Type1, Type2) - attr1: val1, attr2: val2`
 *
 * @param entity - Entity to format
 * @returns Formatted entity string with ID visible
 *
 * @since 0.1.0
 * @category formatting
 */
export const formatEntityForPrompt = (entity: GraphContextEntity): string => {
  const localTypes = A.map(entity.types, extractLocalName);
  const typeStr = A.isNonEmptyReadonlyArray(localTypes)
    ? A.join(localTypes, ", ")
    : "Unknown";

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
    O.getOrElse(() => "")
  );

  return `- [id: ${entity.id}] ${entity.mention} (${typeStr})${attrPart}`;
};

/**
 * Format a single relation for the prompt with visible ID for citation
 *
 * Output format: `- [id: relation_id] Subject --[predicate]--> Object`
 *
 * @param relation - Relation to format
 * @param entityLookup - Map of entity ID to entity for resolving mentions
 * @returns Formatted relation string with ID visible
 *
 * @since 0.1.0
 * @category formatting
 */
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

/**
 * Build entity lookup HashMap from entity array
 *
 * @param entities - Array of entities
 * @returns HashMap of entity ID to entity
 *
 * @since 0.1.0
 * @category utilities
 */
const buildEntityLookup = (
  entities: ReadonlyArray<GraphContextEntity>
): HashMap.HashMap<string, GraphContextEntity> =>
  F.pipe(
    entities,
    A.map((e) => [e.id, e] as const),
    HashMap.fromIterable
  );

// ---------------------------------------------------------------------------
// Prompt Builder
// ---------------------------------------------------------------------------

/**
 * Build the complete user prompt with context and question
 *
 * @param context - Graph context with entities and relations
 * @param question - User's question
 * @returns Formatted user prompt string
 *
 * @since 0.1.0
 * @category prompts
 */
const buildUserPrompt = (context: GraphContext, question: string): string => {
  const entityLookup = buildEntityLookup(context.entities);

  const entitiesSection = A.isNonEmptyReadonlyArray(context.entities)
    ? F.pipe(
        context.entities,
        A.map(formatEntityForPrompt),
        A.join("\n"),
        (lines) => `### Entities\n${lines}`
      )
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

/**
 * Build grounded answer prompt for LLM
 *
 * Creates system and user prompts for generating a grounded answer with
 * citations linked to knowledge graph entities and relations.
 *
 * @param context - Graph context containing entities and relations
 * @param question - User's question to answer
 * @returns Prompt parts with system and user prompts
 *
 * @since 0.1.0
 * @category prompts
 */
export const buildGroundedAnswerPrompt = (
  context: GraphContext,
  question: string
): PromptParts => ({
  system: GROUNDED_ANSWER_SYSTEM_PROMPT,
  user: buildUserPrompt(context, question),
});

// ---------------------------------------------------------------------------
// Citation Parsing Utilities
// ---------------------------------------------------------------------------

/**
 * Regular expression for matching entity citations
 *
 * Matches: `{{entity:entity_id}}`
 *
 * @since 0.1.0
 * @category parsing
 */
export const ENTITY_CITATION_REGEX = /\{\{entity:([^}]+)}}/g;

/**
 * Regular expression for matching relation citations
 *
 * Matches: `{{relation:relation_id}}`
 *
 * @since 0.1.0
 * @category parsing
 */
export const RELATION_CITATION_REGEX = /\{\{relation:([^}]+)}}/g;

/**
 * Parsed citation from LLM response
 *
 * @since 0.1.0
 * @category types
 */
export interface ParsedCitation {
  readonly type: "entity" | "relation";
  readonly id: string;
  readonly matchStart: number;
  readonly matchEnd: number;
}

/**
 * Extract all citations from an LLM response
 *
 * Parses both entity and relation citations from the response text.
 *
 * @param text - LLM response text with citations
 * @returns Array of parsed citations with positions
 *
 * @since 0.1.0
 * @category parsing
 */
export const extractCitations = (text: string): ReadonlyArray<ParsedCitation> => {
  const citations: Array<ParsedCitation> = [];

  // Extract entity citations
  const entityMatches = text.matchAll(ENTITY_CITATION_REGEX);
  for (const match of entityMatches) {
    if (match.index !== undefined && match[1] !== undefined) {
      citations.push({
        type: "entity",
        id: Str.trim(match[1]),
        matchStart: match.index,
        matchEnd: match.index + match[0].length,
      });
    }
  }

  // Extract relation citations
  const relationMatches = text.matchAll(RELATION_CITATION_REGEX);
  for (const match of relationMatches) {
    if (match.index !== undefined && match[1] !== undefined) {
      citations.push({
        type: "relation",
        id: Str.trim(match[1]),
        matchStart: match.index,
        matchEnd: match.index + match[0].length,
      });
    }
  }

  // Sort by position in text
  return A.sort(citations, Order.mapInput(Order.number, (c: ParsedCitation) => c.matchStart));
};

/**
 * Remove citation markers from text for clean display
 *
 * @param text - Text with citation markers
 * @returns Clean text without citation markers
 *
 * @since 0.1.0
 * @category parsing
 */
export const stripCitationMarkers = (text: string): string =>
  text
    .replace(ENTITY_CITATION_REGEX, "")
    .replace(RELATION_CITATION_REGEX, "")
    .replace(/\s{2,}/g, " ")
    .trim();
