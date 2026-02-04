/**
 * PromptTemplates Tests
 *
 * Tests for grounded answer prompt construction utilities.
 *
 * @module knowledge-server/test/GraphRAG/PromptTemplates.test
 * @since 0.1.0
 */

import {
  buildGroundedAnswerPrompt,
  extractCitations,
  formatEntityForPrompt,
  formatRelationForPrompt,
  GROUNDED_ANSWER_SYSTEM_PROMPT,
  type GraphContext,
  type GraphContextEntity,
  type GraphContextRelation,
  stripCitationMarkers,
} from "@beep/knowledge-server/GraphRAG/PromptTemplates";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { assertFalse, assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";

// Test IDs
const testEntityId1 = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__11111111-1111-1111-1111-111111111111"
);
const testEntityId2 = KnowledgeEntityIds.KnowledgeEntityId.make(
  "knowledge_entity__22222222-2222-2222-2222-222222222222"
);
const testRelationId = KnowledgeEntityIds.RelationId.make(
  "knowledge_relation__33333333-3333-3333-3333-333333333333"
);

// Test entities
const createTestEntity = (
  id: string,
  mention: string,
  types: ReadonlyArray<string>,
  attributes?: Readonly<Record<string, string>>
): GraphContextEntity => {
  const entity: GraphContextEntity = { id, mention, types };
  if (attributes !== undefined) {
    return { ...entity, attributes };
  }
  return entity;
};

// Test relations
const createTestRelation = (
  id: string,
  subjectId: string,
  predicate: string,
  objectId: string
): GraphContextRelation => ({
  id,
  subjectId,
  predicate,
  objectId,
});

describe("PromptTemplates", () => {
  describe("GROUNDED_ANSWER_SYSTEM_PROMPT", () => {
    effect(
      "contains citation format instructions",
      Effect.fn(function* () {
        assertTrue(GROUNDED_ANSWER_SYSTEM_PROMPT.includes("{{entity:entity_id}}"));
        assertTrue(GROUNDED_ANSWER_SYSTEM_PROMPT.includes("{{relation:relation_id}}"));
      })
    );

    effect(
      "contains ONLY context instruction",
      Effect.fn(function* () {
        assertTrue(GROUNDED_ANSWER_SYSTEM_PROMPT.includes("ONLY"));
      })
    );

    effect(
      "contains insufficient information guidance",
      Effect.fn(function* () {
        assertTrue(GROUNDED_ANSWER_SYSTEM_PROMPT.includes("don't have enough information"));
      })
    );
  });

  describe("formatEntityForPrompt", () => {
    effect(
      "formats entity with ID visible",
      Effect.fn(function* () {
        const entity = createTestEntity(testEntityId1, "Alice Smith", ["http://schema.org/Person"]);
        const formatted = formatEntityForPrompt(entity);

        assertTrue(formatted.includes(`[id: ${testEntityId1}]`));
        assertTrue(formatted.includes("Alice Smith"));
        assertTrue(formatted.includes("Person"));
      })
    );

    effect(
      "formats entity with multiple types",
      Effect.fn(function* () {
        const entity = createTestEntity(testEntityId1, "Alice", [
          "http://schema.org/Person",
          "http://schema.org/Employee",
        ]);
        const formatted = formatEntityForPrompt(entity);

        assertTrue(formatted.includes("Person"));
        assertTrue(formatted.includes("Employee"));
      })
    );

    effect(
      "formats entity with attributes",
      Effect.fn(function* () {
        const entity = createTestEntity(testEntityId1, "Alice", ["http://schema.org/Person"], {
          "http://schema.org/age": "30",
          "http://schema.org/jobTitle": "Engineer",
        });
        const formatted = formatEntityForPrompt(entity);

        assertTrue(formatted.includes("age: 30"));
        assertTrue(formatted.includes("jobTitle: Engineer"));
      })
    );

    effect(
      "handles unknown type",
      Effect.fn(function* () {
        const entity = createTestEntity(testEntityId1, "Something", []);
        const formatted = formatEntityForPrompt(entity);

        assertTrue(formatted.includes("Unknown"));
      })
    );
  });

  describe("formatRelationForPrompt", () => {
    effect(
      "formats relation with ID and resolved mentions",
      Effect.fn(function* () {
        const entities = [
          createTestEntity(testEntityId1, "Alice", ["Person"]),
          createTestEntity(testEntityId2, "Acme Corp", ["Organization"]),
        ];
        const entityLookup = HashMap.fromIterable(A.map(entities, (e) => [e.id, e] as const));

        const relation = createTestRelation(
          testRelationId,
          testEntityId1,
          "http://schema.org/worksFor",
          testEntityId2
        );

        const formatted = formatRelationForPrompt(relation, entityLookup);

        assertTrue(formatted.includes(`[id: ${testRelationId}]`));
        assertTrue(formatted.includes("Alice"));
        assertTrue(formatted.includes("Acme Corp"));
        assertTrue(formatted.includes("worksFor"));
      })
    );

    effect(
      "uses ID when entity not in lookup",
      Effect.fn(function* () {
        const entityLookup = HashMap.empty<string, GraphContextEntity>();
        const relation = createTestRelation(testRelationId, testEntityId1, "knows", testEntityId2);

        const formatted = formatRelationForPrompt(relation, entityLookup);

        assertTrue(formatted.includes(testEntityId1));
        assertTrue(formatted.includes(testEntityId2));
      })
    );
  });

  describe("buildGroundedAnswerPrompt", () => {
    effect(
      "builds prompt with entities and relations",
      Effect.fn(function* () {
        const context: GraphContext = {
          entities: [
            createTestEntity(testEntityId1, "Alice", ["http://schema.org/Person"]),
            createTestEntity(testEntityId2, "Acme Corp", ["http://schema.org/Organization"]),
          ],
          relations: [
            createTestRelation(testRelationId, testEntityId1, "http://schema.org/worksFor", testEntityId2),
          ],
        };

        const prompts = buildGroundedAnswerPrompt(context, "Where does Alice work?");

        // System prompt should be the constant
        strictEqual(prompts.system, GROUNDED_ANSWER_SYSTEM_PROMPT);

        // User prompt should contain sections
        assertTrue(prompts.user.includes("## Context"));
        assertTrue(prompts.user.includes("### Entities"));
        assertTrue(prompts.user.includes("### Relations"));
        assertTrue(prompts.user.includes("## Question"));
        assertTrue(prompts.user.includes("Where does Alice work?"));
        assertTrue(prompts.user.includes("## Answer (with citations)"));
      })
    );

    effect(
      "handles empty entities",
      Effect.fn(function* () {
        const context: GraphContext = {
          entities: [],
          relations: [],
        };

        const prompts = buildGroundedAnswerPrompt(context, "Test question");

        assertTrue(prompts.user.includes("No entities available"));
        assertTrue(prompts.user.includes("No relations available"));
      })
    );

    effect(
      "includes entity IDs for citation reference",
      Effect.fn(function* () {
        const context: GraphContext = {
          entities: [createTestEntity(testEntityId1, "Alice", ["Person"])],
          relations: [],
        };

        const prompts = buildGroundedAnswerPrompt(context, "Who is Alice?");

        assertTrue(prompts.user.includes(testEntityId1));
      })
    );
  });

  describe("extractCitations", () => {
    effect(
      "extracts entity citations",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}} is a person.`;
        const citations = extractCitations(text);

        strictEqual(A.length(citations), 1);
        const first = A.head(citations);
        assertTrue(O.isSome(first));
        const citation = O.getOrThrow(first);
        strictEqual(citation.type, "entity");
        strictEqual(citation.id, testEntityId1);
      })
    );

    effect(
      "extracts relation citations",
      Effect.fn(function* () {
        const text = `They work together {{relation:${testRelationId}}}.`;
        const citations = extractCitations(text);

        strictEqual(A.length(citations), 1);
        const first = A.head(citations);
        assertTrue(O.isSome(first));
        const citation = O.getOrThrow(first);
        strictEqual(citation.type, "relation");
        strictEqual(citation.id, testRelationId);
      })
    );

    effect(
      "extracts multiple citations in order",
      Effect.fn(function* () {
        const text = `{{entity:${testEntityId1}}} and {{entity:${testEntityId2}}} via {{relation:${testRelationId}}}.`;
        const citations = extractCitations(text);

        strictEqual(A.length(citations), 3);
        const first = A.get(citations, 0);
        const second = A.get(citations, 1);
        const third = A.get(citations, 2);
        assertTrue(O.isSome(first));
        assertTrue(O.isSome(second));
        assertTrue(O.isSome(third));
        strictEqual(O.getOrThrow(first).id, testEntityId1);
        strictEqual(O.getOrThrow(second).id, testEntityId2);
        strictEqual(O.getOrThrow(third).id, testRelationId);
      })
    );

    effect(
      "returns empty for no citations",
      Effect.fn(function* () {
        const citations = extractCitations("Plain text without citations.");
        strictEqual(A.length(citations), 0);
      })
    );
  });

  describe("stripCitationMarkers", () => {
    effect(
      "removes all citation markers",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}} works at {{entity:${testEntityId2}}} {{relation:${testRelationId}}}.`;
        const clean = stripCitationMarkers(text);

        assertFalse(clean.includes("{{"));
        assertFalse(clean.includes("}}"));
        assertTrue(clean.includes("Alice"));
        assertTrue(clean.includes("works at"));
      })
    );

    effect(
      "normalizes whitespace",
      Effect.fn(function* () {
        const text = `A {{entity:id1}}  {{entity:id2}} B`;
        const clean = stripCitationMarkers(text);

        assertFalse(clean.includes("  "));
      })
    );
  });
});
