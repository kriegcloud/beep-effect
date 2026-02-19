/**
 * ContextFormatter Tests
 *
 * Tests for knowledge graph context formatting utilities.
 *
 * @module knowledge-server/test/GraphRAG/ContextFormatter.test
 * @since 0.1.0
 */

import {
  estimateTokens,
  formatContext,
  formatContextWithScores,
  formatEntity,
  truncateToTokenBudget,
} from "@beep/knowledge-server/GraphRAG/ContextFormatter";
import { extractLocalName } from "@beep/knowledge-server/Ontology/constants";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import { makeDomainEntity, makeDomainRelation } from "../_shared/GraphFixtures";

describe("ContextFormatter", () => {
  effect(
    "extracts local name from hash IRI",
    Effect.fn(function* () {
      const iri = "http://www.w3.org/2002/07/owl#Class";
      const localName = extractLocalName(iri);
      strictEqual(localName, "Class");
    })
  );

  effect(
    "extracts local name from slash IRI",
    Effect.fn(function* () {
      const iri = "http://schema.org/Person";
      const localName = extractLocalName(iri);
      strictEqual(localName, "Person");
    })
  );

  effect(
    "returns full string when no separator found",
    Effect.fn(function* () {
      const iri = "SimpleString";
      const localName = extractLocalName(iri);
      strictEqual(localName, "SimpleString");
    })
  );

  effect(
    "formats entity with types",
    Effect.fn(function* () {
      const entity = makeDomainEntity({
        mention: "John Smith",
        types: ["http://schema.org/Person"],
      });
      const formatted = formatEntity(entity);

      assertTrue(formatted.includes("John Smith"));
      assertTrue(formatted.includes("Person"));
    })
  );

  effect(
    "formats entity with attributes",
    Effect.fn(function* () {
      const entity = makeDomainEntity({
        mention: "John Smith",
        types: ["http://schema.org/Person"],
        attributes: {
          "http://schema.org/age": "30",
        },
      });
      const formatted = formatEntity(entity);

      assertTrue(formatted.includes("John Smith"));
      assertTrue(formatted.includes("age: 30"));
    })
  );

  effect(
    "formats context with entities and relations",
    Effect.fn(function* () {
      const e1Id = KnowledgeEntityIds.KnowledgeEntityId.create();
      const e2Id = KnowledgeEntityIds.KnowledgeEntityId.create();

      const entities = [
        makeDomainEntity({ id: e1Id, mention: "John", types: ["http://schema.org/Person"] }),
        makeDomainEntity({ id: e2Id, mention: "Acme", types: ["http://schema.org/Organization"] }),
      ];
      const relations = [
        makeDomainRelation({ subjectId: e1Id, predicate: "http://schema.org/worksFor", objectId: e2Id }),
      ];

      const context = formatContext(entities, relations);

      assertTrue(context.includes("## Entities"));
      assertTrue(context.includes("John"));
      assertTrue(context.includes("Acme"));
      assertTrue(context.includes("## Relations"));
      assertTrue(context.includes("worksFor"));
    })
  );

  effect(
    "formats literal relations",
    Effect.fn(function* () {
      const e1Id = KnowledgeEntityIds.KnowledgeEntityId.create();
      const entities = [makeDomainEntity({ id: e1Id, mention: "John", types: ["http://schema.org/Person"] })];
      const relations = [
        makeDomainRelation({
          subjectId: e1Id,
          predicate: "http://schema.org/age",
          literalValue: "30",
          literalType: "xsd:integer",
        }),
      ];

      const context = formatContext(entities, relations);

      assertTrue(context.includes('"30"'));
      assertTrue(context.includes("xsd:integer"));
    })
  );

  effect(
    "formats context with scores",
    Effect.fn(function* () {
      const e1Id = KnowledgeEntityIds.KnowledgeEntityId.create();
      const entities = [makeDomainEntity({ id: e1Id, mention: "John", types: ["http://schema.org/Person"] })];
      const scores = MutableHashMap.fromIterable([[e1Id, 0.0312]]);

      const context = formatContextWithScores(entities, [], scores);

      assertTrue(context.includes("[score:"));
      assertTrue(context.includes("0.0312"));
    })
  );

  effect(
    "estimates token count",
    Effect.fn(function* () {
      const text = "This is a test string with 32 characters!";
      const tokens = estimateTokens(text);

      // 4 chars per token estimate
      strictEqual(tokens, Math.ceil(text.length / 4));
    })
  );

  effect(
    "truncates context to token budget",
    Effect.fn(function* () {
      // Create many entities with proper IDs
      const entityIds = A.makeBy(50, () => KnowledgeEntityIds.KnowledgeEntityId.create());
      const entities = A.map(entityIds, (id, i) =>
        makeDomainEntity({ id, mention: `Entity ${i}`, types: ["http://schema.org/Thing"] })
      );
      const relations = A.makeBy(20, (i) =>
        makeDomainRelation({
          subjectId: entityIds[i]!,
          predicate: "http://schema.org/related",
          objectId: entityIds[i + 1]!,
        })
      );

      // Small token budget
      const { context, entityCount } = truncateToTokenBudget(entities, relations, 200);

      assertTrue(entityCount < 50);
      assertTrue(estimateTokens(context) <= 200);
    })
  );

  effect(
    "returns full context when within budget",
    Effect.fn(function* () {
      const e1Id = KnowledgeEntityIds.KnowledgeEntityId.create();
      const entities = [makeDomainEntity({ id: e1Id, mention: "John", types: ["http://schema.org/Person"] })];
      const relations = [] as Array<ReturnType<typeof makeDomainRelation>>;

      const result = truncateToTokenBudget(entities, relations, 10000);

      strictEqual(result.entityCount, 1);
      strictEqual(result.relationCount, 0);
    })
  );

  effect(
    "handles empty entities",
    Effect.fn(function* () {
      const context = formatContext([], []);
      strictEqual(context, "");
    })
  );
});
