/**
 * GraphAssembler Tests
 *
 * Tests for knowledge graph construction.
 *
 * @module knowledge-server/test/Extraction/GraphAssembler.test
 * @since 0.1.0
 */
import { describe } from "bun:test";
import { assertTrue, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { GraphAssembler } from "../../src/Extraction/GraphAssembler";
import { ClassifiedEntity } from "../../src/Extraction/schemas/entity-output.schema";
import { ExtractedTriple } from "../../src/Extraction/schemas/relation-output.schema";

describe("GraphAssembler", () => {
  effect("assembles entities into graph", () =>
    Effect.gen(function* () {
      const assembler = yield* GraphAssembler;

      const entities = [
        new ClassifiedEntity({ mention: "John Smith", typeIri: "http://schema.org/Person", confidence: 0.95 }),
        new ClassifiedEntity({ mention: "Acme Corp", typeIri: "http://schema.org/Organization", confidence: 0.9 }),
      ];

      const relations: ExtractedTriple[] = [];

      const graph = yield* assembler.assemble(entities, relations, {
        organizationId: "org-123",
        ontologyId: "test-ontology",
      });

      strictEqual(graph.stats.entityCount, 2);
      strictEqual(graph.stats.relationCount, 0);
      strictEqual(graph.entities.length, 2);
    }).pipe(Effect.provide(GraphAssembler.Default))
  );

  effect("links relations to entities", () =>
    Effect.gen(function* () {
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
        organizationId: "org-123",
        ontologyId: "test-ontology",
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
    }).pipe(Effect.provide(GraphAssembler.Default))
  );

  effect("tracks unresolved subjects", () =>
    Effect.gen(function* () {
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
        organizationId: "org-123",
        ontologyId: "test-ontology",
      });

      strictEqual(graph.stats.relationCount, 0);
      strictEqual(graph.stats.unresolvedSubjects, 1);
    }).pipe(Effect.provide(GraphAssembler.Default))
  );

  effect("tracks unresolved objects", () =>
    Effect.gen(function* () {
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
        organizationId: "org-123",
        ontologyId: "test-ontology",
      });

      strictEqual(graph.stats.relationCount, 0);
      strictEqual(graph.stats.unresolvedObjects, 1);
    }).pipe(Effect.provide(GraphAssembler.Default))
  );

  effect("handles literal values in relations", () =>
    Effect.gen(function* () {
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
        organizationId: "org-123",
        ontologyId: "test-ontology",
      });

      strictEqual(graph.stats.relationCount, 1);
      strictEqual(graph.relations[0]?.literalValue, "30");
      strictEqual(graph.relations[0]?.literalType, "xsd:integer");
    }).pipe(Effect.provide(GraphAssembler.Default))
  );

  effect("merges entities by canonical name when enabled", () =>
    Effect.gen(function* () {
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
        organizationId: "org-123",
        ontologyId: "test-ontology",
        mergeEntities: true,
      });

      strictEqual(graph.stats.entityCount, 1);
    }).pipe(Effect.provide(GraphAssembler.Default))
  );

  effect("handles empty input", () =>
    Effect.gen(function* () {
      const assembler = yield* GraphAssembler;

      const graph = yield* assembler.assemble([], [], {
        organizationId: "org-123",
        ontologyId: "test-ontology",
      });

      strictEqual(graph.stats.entityCount, 0);
      strictEqual(graph.stats.relationCount, 0);
    }).pipe(Effect.provide(GraphAssembler.Default))
  );

  effect("merges multiple graphs", () =>
    Effect.gen(function* () {
      const assembler = yield* GraphAssembler;

      const entities1 = [
        new ClassifiedEntity({ mention: "John", typeIri: "http://schema.org/Person", confidence: 0.95 }),
      ];
      const entities2 = [
        new ClassifiedEntity({ mention: "Jane", typeIri: "http://schema.org/Person", confidence: 0.9 }),
      ];

      const graph1 = yield* assembler.assemble(entities1, [], {
        organizationId: "org-123",
        ontologyId: "test-ontology",
      });
      const graph2 = yield* assembler.assemble(entities2, [], {
        organizationId: "org-123",
        ontologyId: "test-ontology",
      });

      const merged = yield* assembler.merge([graph1, graph2], {
        organizationId: "org-123",
        ontologyId: "test-ontology",
      });

      strictEqual(merged.stats.entityCount, 2);
    }).pipe(Effect.provide(GraphAssembler.Default))
  );
});
