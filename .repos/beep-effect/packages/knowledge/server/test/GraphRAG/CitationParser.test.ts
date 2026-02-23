import {
  countCitations,
  extractEntityIds,
  extractRelationIds,
  hasCitations,
  parseCitations,
  stripAllCitations,
} from "@beep/knowledge-server/GraphRAG/CitationParser";
import { assertFalse, assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { graphRagFixtureIds } from "../_shared/GraphFixtures";

const testEntityId1 = graphRagFixtureIds.entity1;
const testEntityId2 = graphRagFixtureIds.entity2;
const testRelationId = graphRagFixtureIds.relation1;

describe("CitationParser", () => {
  describe("extractEntityIds", () => {
    effect(
      "extracts single entity ID",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}} is a person.`;
        const ids = extractEntityIds(text);

        strictEqual(A.length(ids), 1);
        const firstId = A.head(ids);
        assertTrue(O.isSome(firstId));
        strictEqual(O.getOrThrow(firstId), testEntityId1);
      })
    );

    effect(
      "extracts multiple entity IDs",
      Effect.fn(function* () {
        const text = `{{entity:${testEntityId1}}} works with {{entity:${testEntityId2}}}.`;
        const ids = extractEntityIds(text);

        strictEqual(A.length(ids), 2);
        const first = A.head(ids);
        const second = A.get(ids, 1);
        assertTrue(O.isSome(first));
        assertTrue(O.isSome(second));
        strictEqual(O.getOrThrow(first), testEntityId1);
        strictEqual(O.getOrThrow(second), testEntityId2);
      })
    );

    effect(
      "deduplicates repeated entity IDs",
      Effect.fn(function* () {
        const text = `{{entity:${testEntityId1}}} and {{entity:${testEntityId1}}} again.`;
        const ids = extractEntityIds(text);

        strictEqual(A.length(ids), 1);
        const first = A.head(ids);
        assertTrue(O.isSome(first));
        strictEqual(O.getOrThrow(first), testEntityId1);
      })
    );

    effect(
      "returns empty array for no citations",
      Effect.fn(function* () {
        const text = "This text has no citations.";
        const ids = extractEntityIds(text);

        strictEqual(A.length(ids), 0);
      })
    );

    effect(
      "handles empty string",
      Effect.fn(function* () {
        const ids = extractEntityIds("");
        strictEqual(A.length(ids), 0);
      })
    );
  });

  describe("extractRelationIds", () => {
    effect(
      "extracts single relation ID",
      Effect.fn(function* () {
        const text = `The relationship {{relation:${testRelationId}}} connects them.`;
        const ids = extractRelationIds(text);

        strictEqual(A.length(ids), 1);
        const first = A.head(ids);
        assertTrue(O.isSome(first));
        strictEqual(O.getOrThrow(first), testRelationId);
      })
    );

    effect(
      "returns empty for no relation citations",
      Effect.fn(function* () {
        const text = `Only entity {{entity:${testEntityId1}}} here.`;
        const ids = extractRelationIds(text);

        strictEqual(A.length(ids), 0);
      })
    );
  });

  describe("parseCitations", () => {
    effect(
      "parses citation with entity",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}} is a software engineer.`;
        const citations = parseCitations(text, [testEntityId1]);

        strictEqual(A.length(citations), 1);
        const firstCitation = A.head(citations);
        assertTrue(O.isSome(firstCitation));
        const citation = O.getOrThrow(firstCitation);
        assertTrue(A.length(citation.entityIds) > 0);
        strictEqual(citation.confidence, 1.0);
      })
    );

    effect(
      "parses citation with entity and relation",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}} works at Acme {{entity:${testEntityId2}}} as shown by {{relation:${testRelationId}}}.`;
        const citations = parseCitations(text, [testEntityId1, testEntityId2]);

        strictEqual(A.length(citations), 1);
        const firstCitation = A.head(citations);
        assertTrue(O.isSome(firstCitation));
        const citation = O.getOrThrow(firstCitation);
        strictEqual(A.length(citation.entityIds), 2);
        assertTrue(citation.relationId !== undefined);
      })
    );

    effect(
      "returns empty for no valid entity IDs in context",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}} is here.`;
        const citations = parseCitations(text, []); // Empty context

        strictEqual(A.length(citations), 0);
      })
    );

    effect(
      "filters citations not in context",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}} and Bob {{entity:${testEntityId2}}}.`;
        const citations = parseCitations(text, [testEntityId1]); // Only first ID in context

        // Should only include citations with entities in context
        const allEntityIds = A.flatMap(citations, (c) => c.entityIds);
        assertTrue(A.every(allEntityIds, (id) => id === testEntityId1));
      })
    );

    effect(
      "handles text with no citations",
      Effect.fn(function* () {
        const text = "This is plain text without any citations.";
        const citations = parseCitations(text, [testEntityId1]);

        strictEqual(A.length(citations), 0);
      })
    );
  });

  describe("stripAllCitations", () => {
    effect(
      "strips entity citations",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}} is a person.`;
        const clean = stripAllCitations(text);

        assertFalse(Str.includes("{{")(clean));
        assertFalse(Str.includes("}}")(clean));
        assertTrue(Str.includes("Alice")(clean));
        assertTrue(Str.includes("is a person")(clean));
      })
    );

    effect(
      "strips relation citations",
      Effect.fn(function* () {
        const text = `They are connected {{relation:${testRelationId}}}.`;
        const clean = stripAllCitations(text);

        assertFalse(Str.includes("{{")(clean));
        assertFalse(Str.includes("}}")(clean));
      })
    );

    effect(
      "normalizes whitespace after stripping",
      Effect.fn(function* () {
        const text = `Alice {{entity:${testEntityId1}}}  {{entity:${testEntityId2}}} works.`;
        const clean = stripAllCitations(text);

        assertFalse(Str.includes("  ")(clean));
      })
    );

    effect(
      "returns empty string for whitespace-only result",
      Effect.fn(function* () {
        const text = `{{entity:${testEntityId1}}}`;
        const clean = stripAllCitations(text);

        strictEqual(clean, "");
      })
    );
  });

  describe("countCitations", () => {
    effect(
      "counts all citations",
      Effect.fn(function* () {
        const text = `{{entity:${testEntityId1}}} {{entity:${testEntityId2}}} {{relation:${testRelationId}}}`;
        const count = countCitations(text);

        strictEqual(count, 3);
      })
    );

    effect(
      "returns zero for no citations",
      Effect.fn(function* () {
        const count = countCitations("No citations here.");
        strictEqual(count, 0);
      })
    );
  });

  describe("hasCitations", () => {
    effect(
      "returns true when citations exist",
      Effect.fn(function* () {
        const text = `{{entity:${testEntityId1}}}`;
        assertTrue(hasCitations(text));
      })
    );

    effect(
      "returns false when no citations",
      Effect.fn(function* () {
        assertFalse(hasCitations("Plain text"));
      })
    );
  });
});
