/**
 * GraphAssembler Tests
 *
 * Tests for knowledge graph construction.
 *
 * @module knowledge-server/test/Extraction/GraphAssembler.test
 * @since 0.1.0
 */

import { GraphAssembler } from "@beep/knowledge-server/Extraction/GraphAssembler";
import { ClassifiedEntity } from "@beep/knowledge-server/Extraction/schemas/entity-output.schema";
import { ExtractedTriple } from "@beep/knowledge-server/Extraction/schemas/relation-output.schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

describe("GraphAssembler", () => {
  layer(GraphAssembler.Default, { timeout: Duration.seconds(60) })("GraphAssembler operations", (it) => {
    it.effect(
      "assembles entities into graph",
      Effect.fn(function* () {
        const assembler = yield* GraphAssembler;

        const entities = [
          new ClassifiedEntity({ mention: "John Smith", typeIri: "http://schema.org/Person", confidence: 0.95 }),
          new ClassifiedEntity({ mention: "Acme Corp", typeIri: "http://schema.org/Organization", confidence: 0.9 }),
        ];

        const relations: ExtractedTriple[] = [];

        const graph = yield* assembler.assemble(entities, relations, {
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
        });

        strictEqual(graph.stats.entityCount, 2);
        strictEqual(graph.stats.relationCount, 0);
        strictEqual(graph.entities.length, 2);
      })
    );

    it.effect(
      "links relations to entities",
      Effect.fn(function* () {
        const assembler = yield* GraphAssembler;

        const entities = [
          new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.95 }),
          new ClassifiedEntity({ mention: "Acme", typeIri: "http://schema.org/Organization", confidence: 0.9 }),
        ];

        const relations = [
          new ExtractedTriple({
            subjectMention: "John",
            predicateIri: "http://schema.org/worksFor",
            objectMention: "Acme",
            confidence: 0.85,
          }),
        ];

        const graph = yield* assembler.assemble(entities, relations, {
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
        });

        strictEqual(graph.stats.entityCount, 2);
        strictEqual(graph.stats.relationCount, 1);
        strictEqual(graph.stats.unresolvedSubjects, 0);
        strictEqual(graph.stats.unresolvedObjects, 0);

        // Verify relation has valid entity IDs
        const relation = graph.relations[0];
        assertTrue(relation !== undefined);
        assertTrue(graph.entityIndex.john !== undefined);
        assertTrue(graph.entityIndex.acme !== undefined);
      })
    );

    it.effect(
      "tracks unresolved subjects",
      Effect.fn(function* () {
        const assembler = yield* GraphAssembler;

        const entities = [
          new ClassifiedEntity({ mention: "Acme", typeIri: "http://schema.org/Organization", confidence: 0.9 }),
        ];

        const relations = [
          new ExtractedTriple({
            subjectMention: "Unknown Person",
            predicateIri: "http://schema.org/worksFor",
            objectMention: "Acme",
            confidence: 0.85,
          }),
        ];

        const graph = yield* assembler.assemble(entities, relations, {
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
        });

        strictEqual(graph.stats.relationCount, 0);
        strictEqual(graph.stats.unresolvedSubjects, 1);
      })
    );

    it.effect(
      "tracks unresolved objects",
      Effect.fn(function* () {
        const assembler = yield* GraphAssembler;

        const entities = [
          new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.95 }),
        ];

        const relations = [
          new ExtractedTriple({
            subjectMention: "John",
            predicateIri: "http://schema.org/worksFor",
            objectMention: "Unknown Org",
            confidence: 0.85,
          }),
        ];

        const graph = yield* assembler.assemble(entities, relations, {
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
        });

        strictEqual(graph.stats.relationCount, 0);
        strictEqual(graph.stats.unresolvedObjects, 1);
      })
    );

    it.effect(
      "handles literal values in relations",
      Effect.fn(function* () {
        const assembler = yield* GraphAssembler;

        const entities = [
          new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.95 }),
        ];

        const relations = [
          new ExtractedTriple({
            subjectMention: "John",
            predicateIri: "http://schema.org/age",
            literalValue: "30",
            literalType: "xsd:integer",
            confidence: 0.9,
          }),
        ];

        const graph = yield* assembler.assemble(entities, relations, {
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
        });

        strictEqual(graph.stats.relationCount, 1);
        strictEqual(graph.relations[0]?.literalValue, "30");
        strictEqual(graph.relations[0]?.literalType, "xsd:integer");
      })
    );

    it.effect(
      "merges entities by canonical name when enabled",
      Effect.fn(function* () {
        const assembler = yield* GraphAssembler;

        const entities = [
          new ClassifiedEntity({
            mention: "John Smith",
            typeIri: "http://schema.org/Person",
            confidence: 0.95,
            canonicalName: "john_smith",
          }),
          new ClassifiedEntity({
            mention: "J. Smith",
            typeIri: "http://schema.org/Person",
            confidence: 0.85,
            canonicalName: "john_smith",
          }),
        ];

        const graph = yield* assembler.assemble(entities, [], {
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          mergeEntities: true,
        });

        strictEqual(graph.stats.entityCount, 1);
      })
    );

    it.effect(
      "handles empty input",
      Effect.fn(function* () {
        const assembler = yield* GraphAssembler;

        const graph = yield* assembler.assemble([], [], {
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
        });

        strictEqual(graph.stats.entityCount, 0);
        strictEqual(graph.stats.relationCount, 0);
      })
    );

    it.effect(
      "merges multiple graphs",
      Effect.fn(function* () {
        const assembler = yield* GraphAssembler;

        const entities1 = [
          new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.95 }),
        ];
        const entities2 = [
          new ClassifiedEntity({ mention: "Jane", typeIri: "http://schema.org/Person", confidence: 0.9 }),
        ];

        const organizationId = SharedEntityIds.OrganizationId.create();
        const ontologyId = KnowledgeEntityIds.OntologyId.create();

        const graph1 = yield* assembler.assemble(entities1, [], {
          organizationId,
          ontologyId,
        });
        const graph2 = yield* assembler.assemble(entities2, [], {
          organizationId,
          ontologyId,
        });

        const merged = yield* assembler.merge([graph1, graph2], {
          organizationId,
          ontologyId,
        });

        strictEqual(merged.stats.entityCount, 2);
      })
    );
  });
});
