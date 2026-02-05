/**
 * ContextFormatter Tests
 *
 * Tests for knowledge graph context formatting utilities.
 *
 * @module knowledge-server/test/GraphRAG/ContextFormatter.test
 * @since 0.1.0
 */

import { Entity, Relation } from "@beep/knowledge-domain/entities";
import {
  estimateTokens,
  formatContext,
  formatContextWithScores,
  formatEntity,
  truncateToTokenBudget,
} from "@beep/knowledge-server/GraphRAG/ContextFormatter";
import { extractLocalName } from "@beep/knowledge-server/Ontology/constants";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FC from "effect/FastCheck";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const entityArb = () => FC.sample(Arbitrary.make(Entity.Model), 1)[0]!;
const relationArb = () => FC.sample(Arbitrary.make(Relation.Model), 1)[0]!;

// Mock entity factory - generates its own ID
const createMockEntity = (
  mention: string,
  types: A.NonEmptyReadonlyArray<string>,
  attributes: Record<string, string> = {}
): Entity.Model => {
  const base = entityArb();
  return {
    ...base,
    id: KnowledgeEntityIds.KnowledgeEntityId.create(),
    mention,
    types,
    attributes,
    organizationId: SharedEntityIds.OrganizationId.create(),
    ontologyId: O.some(KnowledgeEntityIds.OntologyId.create()),
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
  };
};

// Mock entity factory with specific ID - for when we need to reference the ID
const createMockEntityWithId = (
  id: KnowledgeEntityIds.KnowledgeEntityId.Type,
  mention: string,
  types: A.NonEmptyReadonlyArray<string>,
  attributes: Record<string, string> = {}
): Entity.Model => {
  const base = entityArb();
  return new Entity.Model({
    ...base,
    id,
    mention,
    types,
    attributes,
    organizationId: SharedEntityIds.OrganizationId.create(),
    ontologyId: O.some(KnowledgeEntityIds.OntologyId.create()),
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
  });
};

// Mock relation factory
let relationRowIdCounter = 0;
const createMockRelation = (
  subjectId: KnowledgeEntityIds.KnowledgeEntityId.Type,
  predicate: string,
  objectId?: undefined | KnowledgeEntityIds.KnowledgeEntityId.Type,
  literalValue?: undefined | string,
  literalType?: undefined | string
): Relation.Model => {
  const base = relationArb();
  relationRowIdCounter += 1;
  return new Relation.Model({
    ...base,
    id: KnowledgeEntityIds.RelationId.create(),
    subjectId,
    predicate,
    objectId: O.fromNullable(objectId),
    literalValue: O.fromNullable(literalValue),
    literalType: O.fromNullable(literalType),
    organizationId: SharedEntityIds.OrganizationId.create(),
    ontologyId: KnowledgeEntityIds.OntologyId.create(),
    createdAt: DateTime.unsafeNow(),
    updatedAt: DateTime.unsafeNow(),
    _rowId: KnowledgeEntityIds.RelationId.privateSchema.make(relationRowIdCounter),
    deletedAt: O.none(),
    version: 1,
    source: O.some("test"),
  });
};

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
      const entity = createMockEntity("John Smith", ["http://schema.org/Person"]);
      const formatted = formatEntity(entity);

      assertTrue(formatted.includes("John Smith"));
      assertTrue(formatted.includes("Person"));
    })
  );

  effect(
    "formats entity with attributes",
    Effect.fn(function* () {
      const entity = createMockEntity("John Smith", ["http://schema.org/Person"], {
        "http://schema.org/age": "30",
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
        createMockEntityWithId(e1Id, "John", ["http://schema.org/Person"]),
        createMockEntityWithId(e2Id, "Acme", ["http://schema.org/Organization"]),
      ];
      const relations = [createMockRelation(e1Id, "http://schema.org/worksFor", e2Id)];

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
      const entities = [createMockEntityWithId(e1Id, "John", ["http://schema.org/Person"])];
      const relations = [createMockRelation(e1Id, "http://schema.org/age", undefined, "30", "xsd:integer")];

      const context = formatContext(entities, relations);

      assertTrue(context.includes('"30"'));
      assertTrue(context.includes("xsd:integer"));
    })
  );

  effect(
    "formats context with scores",
    Effect.fn(function* () {
      const e1Id = KnowledgeEntityIds.KnowledgeEntityId.create();
      const entities = [createMockEntityWithId(e1Id, "John", ["http://schema.org/Person"])];
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
        createMockEntityWithId(id, `Entity ${i}`, ["http://schema.org/Thing"])
      );
      const relations = A.makeBy(20, (i) =>
        createMockRelation(entityIds[i]!, "http://schema.org/related", entityIds[i + 1])
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
      const entities = [createMockEntityWithId(e1Id, "John", ["http://schema.org/Person"])];
      const relations: Relation.Model[] = [];

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
