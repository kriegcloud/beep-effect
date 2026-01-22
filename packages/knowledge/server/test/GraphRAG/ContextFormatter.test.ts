/**
 * ContextFormatter Tests
 *
 * Tests for knowledge graph context formatting utilities.
 *
 * @module knowledge-server/test/GraphRAG/ContextFormatter.test
 * @since 0.1.0
 */
import { describe } from "bun:test";
import { assertTrue, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import {
  estimateTokens,
  extractLocalName,
  formatContext,
  formatContextWithScores,
  formatEntity,
  truncateToTokenBudget,
} from "../../src/GraphRAG/ContextFormatter";

// Mock entity factory
const createMockEntity = (id: string, mention: string, types: string[], attributes: Record<string, string> = {}) =>
  ({
    id,
    mention,
    types,
    attributes,
    organizationId: "org-1",
    ontologyId: "ont-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as any;

// Mock relation factory
const createMockRelation = (
  subjectId: string,
  predicate: string,
  objectId?: string,
  literalValue?: string,
  literalType?: string
) =>
  ({
    id: `rel-${subjectId}-${objectId ?? literalValue}`,
    subjectId,
    predicate,
    objectId,
    literalValue,
    literalType,
    organizationId: "org-1",
    ontologyId: "ont-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as any;

describe("ContextFormatter", () => {
  effect("extracts local name from hash IRI", () =>
    Effect.gen(function* () {
      const iri = "http://www.w3.org/2002/07/owl#Class";
      const localName = extractLocalName(iri);
      strictEqual(localName, "Class");
    })
  );

  effect("extracts local name from slash IRI", () =>
    Effect.gen(function* () {
      const iri = "http://schema.org/Person";
      const localName = extractLocalName(iri);
      strictEqual(localName, "Person");
    })
  );

  effect("returns full string when no separator found", () =>
    Effect.gen(function* () {
      const iri = "SimpleString";
      const localName = extractLocalName(iri);
      strictEqual(localName, "SimpleString");
    })
  );

  effect("formats entity with types", () =>
    Effect.gen(function* () {
      const entity = createMockEntity("e1", "John Smith", ["http://schema.org/Person"]);
      const formatted = formatEntity(entity);

      assertTrue(formatted.includes("John Smith"));
      assertTrue(formatted.includes("Person"));
    })
  );

  effect("formats entity with attributes", () =>
    Effect.gen(function* () {
      const entity = createMockEntity("e1", "John Smith", ["http://schema.org/Person"], {
        "http://schema.org/age": "30",
      });
      const formatted = formatEntity(entity);

      assertTrue(formatted.includes("John Smith"));
      assertTrue(formatted.includes("age: 30"));
    })
  );

  effect("formats context with entities and relations", () =>
    Effect.gen(function* () {
      const entities = [
        createMockEntity("e1", "John", ["http://schema.org/Person"]),
        createMockEntity("e2", "Acme", ["http://schema.org/Organization"]),
      ];
      const relations = [createMockRelation("e1", "http://schema.org/worksFor", "e2")];

      const context = formatContext(entities, relations);

      assertTrue(context.includes("## Entities"));
      assertTrue(context.includes("John"));
      assertTrue(context.includes("Acme"));
      assertTrue(context.includes("## Relations"));
      assertTrue(context.includes("worksFor"));
    })
  );

  effect("formats literal relations", () =>
    Effect.gen(function* () {
      const entities = [createMockEntity("e1", "John", ["http://schema.org/Person"])];
      const relations = [createMockRelation("e1", "http://schema.org/age", undefined, "30", "xsd:integer")];

      const context = formatContext(entities, relations);

      assertTrue(context.includes('"30"'));
      assertTrue(context.includes("xsd:integer"));
    })
  );

  effect("formats context with scores", () =>
    Effect.gen(function* () {
      const entities = [createMockEntity("e1", "John", ["http://schema.org/Person"])];
      const scores = new Map([["e1", 0.0312]]);

      const context = formatContextWithScores(entities, [], scores);

      assertTrue(context.includes("[score:"));
      assertTrue(context.includes("0.0312"));
    })
  );

  effect("estimates token count", () =>
    Effect.gen(function* () {
      const text = "This is a test string with 32 characters!";
      const tokens = estimateTokens(text);

      // 4 chars per token estimate
      strictEqual(tokens, Math.ceil(text.length / 4));
    })
  );

  effect("truncates context to token budget", () =>
    Effect.gen(function* () {
      // Create many entities to exceed budget
      const entities = Array.from({ length: 50 }, (_, i) =>
        createMockEntity(`e${i}`, `Entity ${i}`, ["http://schema.org/Thing"])
      );
      const relations = Array.from({ length: 20 }, (_, i) =>
        createMockRelation(`e${i}`, "http://schema.org/related", `e${i + 1}`)
      );

      // Small token budget
      const { context, entityCount } = truncateToTokenBudget(entities, relations, 200);

      assertTrue(entityCount < 50);
      assertTrue(estimateTokens(context) <= 200);
    })
  );

  effect("returns full context when within budget", () =>
    Effect.gen(function* () {
      const entities = [createMockEntity("e1", "John", ["http://schema.org/Person"])];
      const relations: ReturnType<typeof createMockRelation>[] = [];

      const result = truncateToTokenBudget(entities, relations, 10000);

      strictEqual(result.entityCount, 1);
      strictEqual(result.relationCount, 0);
    })
  );

  effect("handles empty entities", () =>
    Effect.gen(function* () {
      const context = formatContext([], []);
      strictEqual(context, "");
    })
  );
});
