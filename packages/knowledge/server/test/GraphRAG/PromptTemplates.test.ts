import {
  buildGroundedAnswerPrompt,
  extractCitations,
  formatEntityForPrompt,
  formatRelationForPrompt,
  GROUNDED_ANSWER_SYSTEM_PROMPT,
  type GraphContext,
  type GraphContextEntity,
  stripCitationMarkers,
} from "@beep/knowledge-server/GraphRAG/PromptTemplates";
import { assertFalse, assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { graphRagFixtureIds, makeGraphContextEntity, makeGraphContextRelation } from "../_shared/GraphFixtures";

const testEntityId1 = graphRagFixtureIds.entity1;
const testEntityId2 = graphRagFixtureIds.entity2;
const testRelationId = graphRagFixtureIds.relation1;

describe("PromptTemplates", () => {
  describe("GROUNDED_ANSWER_SYSTEM_PROMPT", () => {
    effect(
      "contains citation format instructions",
      Effect.fn(function* () {
        assertTrue(Str.includes("{{entity:entity_id}}")(GROUNDED_ANSWER_SYSTEM_PROMPT));
        assertTrue(Str.includes("{{relation:relation_id}}")(GROUNDED_ANSWER_SYSTEM_PROMPT));
      })
    );

    effect(
      "contains ONLY context instruction",
      Effect.fn(function* () {
        assertTrue(Str.includes("ONLY")(GROUNDED_ANSWER_SYSTEM_PROMPT));
      })
    );

    effect(
      "contains insufficient information guidance",
      Effect.fn(function* () {
        assertTrue(Str.includes("don't have enough information")(GROUNDED_ANSWER_SYSTEM_PROMPT));
      })
    );
  });

  describe("formatEntityForPrompt", () => {
    effect(
      "formats entity with ID visible",
      Effect.fn(function* () {
        const entity = makeGraphContextEntity({
          id: testEntityId1,
          mention: "Alice Smith",
          types: ["http://schema.org/Person"],
        });
        const formatted = formatEntityForPrompt(entity);

        assertTrue(Str.includes(`[id: ${testEntityId1}]`)(formatted));
        assertTrue(Str.includes("Alice Smith")(formatted));
        assertTrue(Str.includes("Person")(formatted));
      })
    );

    effect(
      "formats entity with multiple types",
      Effect.fn(function* () {
        const entity = makeGraphContextEntity({
          id: testEntityId1,
          mention: "Alice",
          types: ["http://schema.org/Person", "http://schema.org/Employee"],
        });
        const formatted = formatEntityForPrompt(entity);

        assertTrue(Str.includes("Person")(formatted));
        assertTrue(Str.includes("Employee")(formatted));
      })
    );

    effect(
      "formats entity with attributes",
      Effect.fn(function* () {
        const entity = makeGraphContextEntity({
          id: testEntityId1,
          mention: "Alice",
          types: ["http://schema.org/Person"],
          attributes: {
            "http://schema.org/age": "30",
            "http://schema.org/jobTitle": "Engineer",
          },
        });
        const formatted = formatEntityForPrompt(entity);

        assertTrue(Str.includes("age: 30")(formatted));
        assertTrue(Str.includes("jobTitle: Engineer")(formatted));
      })
    );

    effect(
      "handles unknown type",
      Effect.fn(function* () {
        const entity = makeGraphContextEntity({ id: testEntityId1, mention: "Something", types: [] });
        const formatted = formatEntityForPrompt(entity);

        assertTrue(Str.includes("Unknown")(formatted));
      })
    );
  });

  describe("formatRelationForPrompt", () => {
    effect(
      "formats relation with ID and resolved mentions",
      Effect.fn(function* () {
        const entities = [
          makeGraphContextEntity({ id: testEntityId1, mention: "Alice", types: ["Person"] }),
          makeGraphContextEntity({ id: testEntityId2, mention: "Acme Corp", types: ["Organization"] }),
        ];
        const entityLookup = HashMap.fromIterable(A.map(entities, (e) => [e.id, e] as const));

        const relation = makeGraphContextRelation({
          id: testRelationId,
          subjectId: testEntityId1,
          predicate: "http://schema.org/worksFor",
          objectId: testEntityId2,
        });

        const formatted = formatRelationForPrompt(relation, entityLookup);

        assertTrue(Str.includes(`[id: ${testRelationId}]`)(formatted));
        assertTrue(Str.includes("Alice")(formatted));
        assertTrue(Str.includes("Acme Corp")(formatted));
        assertTrue(Str.includes("worksFor")(formatted));
      })
    );

    effect(
      "uses ID when entity not in lookup",
      Effect.fn(function* () {
        const entityLookup = HashMap.empty<string, GraphContextEntity>();
        const relation = makeGraphContextRelation({
          id: testRelationId,
          subjectId: testEntityId1,
          predicate: "knows",
          objectId: testEntityId2,
        });

        const formatted = formatRelationForPrompt(relation, entityLookup);

        assertTrue(Str.includes(testEntityId1)(formatted));
        assertTrue(Str.includes(testEntityId2)(formatted));
      })
    );
  });

  describe("buildGroundedAnswerPrompt", () => {
    effect(
      "builds prompt with entities and relations",
      Effect.fn(function* () {
        const context: GraphContext = {
          entities: [
            makeGraphContextEntity({
              id: testEntityId1,
              mention: "Alice",
              types: ["http://schema.org/Person"],
            }),
            makeGraphContextEntity({
              id: testEntityId2,
              mention: "Acme Corp",
              types: ["http://schema.org/Organization"],
            }),
          ],
          relations: [
            makeGraphContextRelation({
              id: testRelationId,
              subjectId: testEntityId1,
              predicate: "http://schema.org/worksFor",
              objectId: testEntityId2,
            }),
          ],
        };

        const prompts = buildGroundedAnswerPrompt(context, "Where does Alice work?");

        strictEqual(prompts.system, GROUNDED_ANSWER_SYSTEM_PROMPT);

        assertTrue(Str.includes("## Context")(prompts.user));
        assertTrue(Str.includes("### Entities")(prompts.user));
        assertTrue(Str.includes("### Relations")(prompts.user));
        assertTrue(Str.includes("## Question")(prompts.user));
        assertTrue(Str.includes("Where does Alice work?")(prompts.user));
        assertTrue(Str.includes("## Answer (with citations)")(prompts.user));
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

        assertTrue(Str.includes("No entities available")(prompts.user));
        assertTrue(Str.includes("No relations available")(prompts.user));
      })
    );

    effect(
      "includes entity IDs for citation reference",
      Effect.fn(function* () {
        const context: GraphContext = {
          entities: [makeGraphContextEntity({ id: testEntityId1, mention: "Alice", types: ["Person"] })],
          relations: [],
        };

        const prompts = buildGroundedAnswerPrompt(context, "Who is Alice?");

        assertTrue(Str.includes(testEntityId1)(prompts.user));
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

        assertFalse(Str.includes("{{")(clean));
        assertFalse(Str.includes("}}")(clean));
        assertTrue(Str.includes("Alice")(clean));
        assertTrue(Str.includes("works at")(clean));
      })
    );

    effect(
      "normalizes whitespace",
      Effect.fn(function* () {
        const text = `A {{entity:id1}}  {{entity:id2}} B`;
        const clean = stripCitationMarkers(text);

        assertFalse(Str.includes("  ")(clean));
      })
    );
  });
});
